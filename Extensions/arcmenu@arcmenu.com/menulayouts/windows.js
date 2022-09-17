const Me = imports.misc.extensionUtils.getCurrentExtension();

const {Clutter, GLib, Gio, Gtk, Shell, St} = imports.gi;
const BaseMenuLayout = Me.imports.menulayouts.baseMenuLayout;
const Constants = Me.imports.constants;
const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const Main = imports.ui.main;
const MW = Me.imports.menuWidgets;
const PlaceDisplay = Me.imports.placeDisplay;
const PopupMenu = imports.ui.popupMenu;
const Utils =  Me.imports.utils;
const _ = Gettext.gettext;

var createMenu = class extends BaseMenuLayout.BaseLayout{
    constructor(menuButton) {
        super(menuButton, {
            Search: true,
            SearchDisplayType: Constants.DisplayType.LIST,
            DisplayType: Constants.DisplayType.LIST,
            ShortcutContextMenuLocation: Constants.ContextMenuLocation.RIGHT,
            ColumnSpacing: 0,
            RowSpacing: 0,
            DefaultMenuWidth: 300,
            DefaultIconGridStyle: "SmallIconGrid",
            VerticalMainBox: false,
            DefaultCategoryIconSize: Constants.LARGE_ICON_SIZE,
            DefaultApplicationIconSize: Constants.LARGE_ICON_SIZE,
            DefaultQuickLinksIconSize: Constants.EXTRA_SMALL_ICON_SIZE,
            DefaultButtonsIconSize: Constants.EXTRA_SMALL_ICON_SIZE,
            DefaultPinnedIconSize: Constants.LARGE_ICON_SIZE,
        });
    }
    createLayout(){
        super.createLayout();
        this.actionsBox = new St.BoxLayout({
            x_expand: true,
            y_expand: true,
            x_align: Clutter.ActorAlign.START,
            y_align: Clutter.ActorAlign.FILL,
            vertical: true
        });
        this.actionsBox.style = "margin: 0px 0px 0px 0px; spacing: 6px;";
        this.mainBox.add_child(this.actionsBox);

        this.extrasButton = new MW.ExtrasButton(this);
        this.extrasButton.y_expand = true;
        this.extrasButton.y_align= Clutter.ActorAlign.START;
        this.actionsBox.add_child(this.extrasButton);

        let isContainedInCategory = false;
        let filesButton = this.createMenuItem([_("Files"), "", "org.gnome.Nautilus.desktop"], Constants.DisplayType.BUTTON, isContainedInCategory);
        this.actionsBox.add_child(filesButton);

        let terminalButton = this.createMenuItem([_("Terminal"), "", "org.gnome.Terminal.desktop"], Constants.DisplayType.BUTTON, isContainedInCategory);
        this.actionsBox.add_child(terminalButton);

        let settingsButton = this.createMenuItem([_("Settings"),"", "org.gnome.Settings.desktop"], Constants.DisplayType.BUTTON, isContainedInCategory);
        if(settingsButton.shouldShow)
            this.actionsBox.add_child(settingsButton);

        this.leaveButton = new MW.LeaveButton(this);
        this.actionsBox.add_child(this.leaveButton);

        this.subMainBox = new St.BoxLayout({
            x_expand: true,
            y_expand: true,
            y_align: Clutter.ActorAlign.FILL,
            vertical: true,
        });
        this.mainBox.add_child(this.subMainBox);

        this.pinnedAppsScrollBox = this._createScrollBox({
            x_expand: true,
            y_expand: true,
            y_align: Clutter.ActorAlign.START,
            overlay_scrollbars: true,
            style_class: this.disableFadeEffect ? '' : 'vfade'
        });

        this.pinnedAppsBox = new St.BoxLayout({
            vertical: true,
            x_expand: true
        });
        this.pinnedAppsScrollBox.add_actor(this.pinnedAppsBox);

        let layout = new Clutter.GridLayout({
            orientation: Clutter.Orientation.VERTICAL,
            column_spacing: 10,
            row_spacing: 10
        });
        this.pinnedAppsGrid = new St.Widget({
            x_expand: true,
            x_align: Clutter.ActorAlign.CENTER,
            layout_manager: layout
        });
        layout.hookup_style(this.pinnedAppsGrid);

        this.searchBox.name = "ArcSearchEntryRound";
        this.searchBox.style = "margin: 15px 10px 0px 10px;";

        this.applicationsBox = new St.BoxLayout({
            vertical: true
        });

        this.applicationsScrollBox = this._createScrollBox({
            x_expand: false,
            y_expand: false,
            x_align: Clutter.ActorAlign.START,
            y_align: Clutter.ActorAlign.START,
            overlay_scrollbars: true,
            style_class: (this.disableFadeEffect ? '' : 'small-vfade'),
        });

        this.applicationsScrollBox.add_actor(this.applicationsBox);
        this.subMainBox.add_child(this.applicationsScrollBox);
        this.subMainBox.add_child(this.searchBox);
        this.activeCategoryType = Constants.CategoryType.HOME_SCREEN;

        let SOFTWARE_TRANSLATIONS = [_("Software"), _("Settings"), _("Tweaks"), _("Terminal"), _("Activities Overview"), _("ArcMenu Settings")];
        let applicationShortcutsList = this._settings.get_value('application-shortcuts-list').deep_unpack();
        this.applicationShortcuts = [];
        for(let i = 0; i < applicationShortcutsList.length; i++){
            let applicationName = applicationShortcutsList[i][0];
            let shortcutMenuItem = new MW.ShortcutMenuItem(this, _(applicationName), applicationShortcutsList[i][1], applicationShortcutsList[i][2], Constants.DisplayType.LIST);
            if(shortcutMenuItem.shouldShow)
                this.applicationShortcuts.push(shortcutMenuItem);
        }

        let directoryShortcutsList = this._settings.get_value('directory-shortcuts-list').deep_unpack();
        this._loadPlaces(directoryShortcutsList);

        this.externalDevicesBox = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            y_expand: true
        });
        this._sections = { };
        this.placesManager = new PlaceDisplay.PlacesManager();
        for (let i = 0; i < Constants.SECTIONS.length; i++) {
            let id = Constants.SECTIONS[i];
            this._sections[id] = new St.BoxLayout({
                vertical: true
            });
            this.placeManagerUpdatedID = this.placesManager.connect(`${id}-updated`, () => {
                this._redisplayPlaces(id);
            });

            this._createPlaces(id);
            this.externalDevicesBox.add_child(this._sections[id]);
        }

        this.updateWidth();
        this.loadCategories();
        this.loadPinnedApps();

        this._createExtrasMenu();
        this.setDefaultMenuView();
    }

    loadPinnedApps(){
        this.layoutProperties.DisplayType = Constants.DisplayType.GRID;
        super.loadPinnedApps();
        this.pinnedAppsGrid.layout_manager.forceGridColumns = this.getColumnsFromGridIconSizeSetting();
        this.layoutProperties.DisplayType = Constants.DisplayType.LIST;
    }

    _createPlaces(id) {
        let places = this.placesManager.get(id);

        if(id === 'bookmarks' && places.length > 0){
            this._sections[id].add_child(this.createLabelRow(_("Bookmarks")));
            for (let i = 0; i < places.length; i++){
                let item = new MW.PlaceMenuItem(this, places[i], Constants.DisplayType.LIST);
                this._sections[id].add_child(item);
            }
        }

        if(id === 'devices' && places.length > 0){
            this._sections[id].add_child(this.createLabelRow(_("Devices")));
            for (let i = 0; i < places.length; i++){
                let item = new MW.PlaceMenuItem(this, places[i], Constants.DisplayType.LIST);
                this._sections[id].add_child(item);
            }
        }

        if(id === 'network' && places.length > 0){
            this._sections[id].add_child(this.createLabelRow(_("Network")));
            for (let i = 0; i < places.length; i++){
                let item = new MW.PlaceMenuItem(this, places[i], Constants.DisplayType.LIST);
                this._sections[id].add_child(item);
            }
        }
    }

    _loadPlaces(directoryShortcutsList) {
        this.directoryShortcuts = [];
        for (let i = 0; i < directoryShortcutsList.length; i++) {
            let directory = directoryShortcutsList[i];
            let isContainedInCategory = false;
            let placeMenuItem = this.createMenuItem(directory, Constants.DisplayType.LIST, isContainedInCategory);
            this.directoryShortcuts.push(placeMenuItem);
        }
    }

    _createExtrasMenu(){
        this.dummyCursor = new St.Widget({ width: 0, height: 0, opacity: 0 });
        Main.uiGroup.add_child(this.dummyCursor);

        this.extrasMenu = new PopupMenu.PopupMenu(this.dummyCursor, 0, St.Side.TOP);
        this.extrasMenu.box.style = "box-shadow: 3px 0px 4px 0 rgba(0, 0, 0, 0.2);";
        this.extrasMenu.actor.add_style_class_name('popup-menu arcmenu-menu');

        this.section = new PopupMenu.PopupMenuSection();
        this.extrasMenu.addMenuItem(this.section);

        this.leftPanelPopup = new St.BoxLayout({
            vertical: true,
        });
        this.leftPanelPopup._delegate = this.leftPanelPopup;
        this.section.actor.add_child(this.leftPanelPopup);

        let headerBox = new St.BoxLayout({
            x_expand: false,
            y_expand: false,
            x_align: Clutter.ActorAlign.FILL,
            y_align: Clutter.ActorAlign.START,
            vertical: true
        });
        this.leftPanelPopup.add_child(headerBox);

        this.backButton = new MW.BackMenuItem(this);
        this.backButton.connect("activate", () => this.toggleExtrasMenu());
        headerBox.add_child(this.backButton);

        let separator = new MW.ArcMenuSeparator(Constants.SeparatorStyle.MEDIUM, Constants.SeparatorAlignment.HORIZONTAL);
        headerBox.add_child(separator);

        this.computerScrollBox = this._createScrollBox({
            x_expand: true,
            y_expand: true,
            y_align: Clutter.ActorAlign.START,
            overlay_scrollbars: true,
            reactive: true,
            style_class: this.disableFadeEffect ? '' : 'small-vfade',
        });

        this.leftPanelPopup.add_child(this.computerScrollBox);

        this.computerBox = new St.BoxLayout({
            vertical: true
        });
        this.computerScrollBox.add_actor(this.computerBox);

        this.computerBox.add_child(this.createLabelRow(_("Application Shortcuts")));
        for(let i = 0; i < this.applicationShortcuts.length; i++){
            this.computerBox.add_child(this.applicationShortcuts[i]);
        }
        this.computerBox.add_child(this.createLabelRow(_("Places")));
        for(let i = 0; i < this.directoryShortcuts.length; i++){
            this.computerBox.add_child(this.directoryShortcuts[i]);
        }
        this.computerBox.add_child(this.externalDevicesBox);

        let themeContext = St.ThemeContext.get_for_stage(global.stage);
        let scaleFactor = themeContext.scale_factor;
        let height = Math.round(this._settings.get_int('menu-height') / scaleFactor) - 1;
        this.leftPanelPopup.style = `height: ${height}px;`;

        this.subMenuManager.addMenu(this.extrasMenu);
        this.extrasMenu.actor.hide();
        Main.uiGroup.add_child(this.extrasMenu.actor);
        this.extrasMenu.connect('open-state-changed', (menu, open) => {
            if(!open){
                this.extrasButton.active = false;
                this.extrasButton.sync_hover();
                this.extrasButton.hovered = this.extrasButton.hover;
            }
        });
    }

    toggleExtrasMenu(){
        let appsScrollBoxAdj = this.pinnedAppsScrollBox.get_vscroll_bar().get_adjustment();
        appsScrollBoxAdj.set_value(0);

        let themeNode = this.arcMenu.actor.get_theme_node();

        this.arcMenu.actor.get_allocation_box();
        let [x, y] = this.arcMenu.actor.get_transformed_position();
        let rise = themeNode.get_length('-arrow-rise');

        if(this.arcMenu._arrowSide === St.Side.TOP)
            y += 1;
        else
            y -= rise - 1;

        if(this.arcMenu._arrowSide === St.Side.LEFT)
            x += rise + 1;

        this.dummyCursor.set_position(x, y);
        this.extrasMenu.toggle();
        if(this.extrasMenu.isOpen){
            this.activeMenuItem = this.backButton;
            this.backButton.grab_key_focus();
        }
    }

    setDefaultMenuView(){
        super.setDefaultMenuView();

        this.displayAllApps();
        if(!this._settings.get_boolean('windows-disable-pinned-apps')){
            if(!this.mainBox.contains(this.pinnedAppsScrollBox))
                this.mainBox.add_child(this.pinnedAppsScrollBox);
            this.displayPinnedApps();
        }

        let appsScrollBoxAdj = this.pinnedAppsScrollBox.get_vscroll_bar().get_adjustment();
        appsScrollBoxAdj.set_value(0);
    }

    displayAllApps(){
        this._clearActorsFromBox();
        let label = this._createLabelWithSeparator(_("Frequent"));
        this.activeMenuItemSet = false;

        if(!this._settings.get_boolean('windows-disable-frequent-apps')){
            let mostUsed = Shell.AppUsage.get_default().get_most_used();
            this.frequentAppsList = [];
            for (let i = 0; i < mostUsed.length; i++) {
                if (mostUsed[i] && mostUsed[i].get_app_info().should_show()){
                    let item = new MW.ApplicationMenuItem(this, mostUsed[i], Constants.DisplayType.LIST);
                    this.frequentAppsList.push(item);
                }
            }
            const MaxItems = 8;
            if(this.frequentAppsList.length > 0){
                this.applicationsBox.add_child(label);
                for (let i = 0; i < this.frequentAppsList.length && i < MaxItems; i++) {
                    let item = this.frequentAppsList[i];
                    if(item.get_parent())
                        item.get_parent().remove_child(item);
                    this.applicationsBox.add_child(item);
                    if(!this.activeMenuItemSet){
                        this._frequentActiveItem = item;
                        this.activeMenuItemSet = true;
                    }
                }
            }
        }

        let appList = [];
        this.applicationsMap.forEach((value,key,map) => {
            appList.push(key);
        });
        appList.sort((a, b) => {
            return a.get_name().toLowerCase() > b.get_name().toLowerCase();
        });
        this.layoutProperties.DisplayType = Constants.DisplayType.LIST;
        this._displayAppList(appList, Constants.CategoryType.ALL_PROGRAMS, this.applicationsGrid);

        if(this.activeMenuItemSet)
            this.activeMenuItem = this._frequentActiveItem;
    }

    loadCategories() {
        this.categoryDirectories = null;
        this.categoryDirectories = new Map();
        this.hasPinnedApps = true;
        super.loadCategories();
    }

    _clearActorsFromBox(box){
        super._clearActorsFromBox(box);
        this.activeCategoryType = Constants.CategoryType.HOME_SCREEN;
    }

    displayPinnedApps() {
        super._clearActorsFromBox(this.pinnedAppsBox);
        this.pinnedAppsGrid.remove_all_children();
        let label = this.createLabelRow(_("Pinned Apps"));
        this.pinnedAppsBox.add_child(label);
        this._displayAppList(this.pinnedAppsArray, Constants.CategoryType.HOME_SCREEN, this.pinnedAppsGrid);
        if(!this.pinnedAppsBox.contains(this.pinnedAppsGrid))
            this.pinnedAppsBox.add_child(this.pinnedAppsGrid);

        if(this.activeMenuItemSet)
            this.activeMenuItem = this._frequentActiveItem;
    }
}

const Me = imports.misc.extensionUtils.getCurrentExtension();

const {Clutter, Gio, GLib, Gtk, Shell, St} = imports.gi;
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
            DisplayType: Constants.DisplayType.GRID,
            SearchDisplayType: Constants.DisplayType.GRID,
            ShortcutContextMenuLocation: Constants.ContextMenuLocation.BOTTOM_CENTERED,
            ColumnSpacing: 0,
            RowSpacing: 0,
            VerticalMainBox: true,
            DefaultMenuWidth: 650,
            DefaultIconGridStyle: "MediumRectIconGrid",
            DefaultCategoryIconSize: Constants.LARGE_ICON_SIZE,
            DefaultApplicationIconSize: Constants.LARGE_ICON_SIZE,
            DefaultQuickLinksIconSize: Constants.EXTRA_SMALL_ICON_SIZE,
            DefaultButtonsIconSize: Constants.EXTRA_SMALL_ICON_SIZE,
            DefaultPinnedIconSize: Constants.LARGE_ICON_SIZE,
        });
    }

    createLayout(){
        super.createLayout();

        this.topBox = new St.BoxLayout({
            x_expand: false,
            y_expand: false,
            x_align: Clutter.ActorAlign.FILL,
            y_align: Clutter.ActorAlign.START,
            vertical: false
        });

        this.subMainBox= new St.BoxLayout({
            x_expand: true,
            y_expand: true,
            x_align: Clutter.ActorAlign.FILL,
            y_align: Clutter.ActorAlign.FILL,
            vertical: true
        });
        this.mainBox.add_child(this.subMainBox);

        this.searchBox.style = "margin: 5px 15px 10px 15px;";

        this.topBox.add_child(this.searchBox);
        this.mainBox.insert_child_at_index(this.topBox, 0);

        this.applicationsBox = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            y_expand: true,
            x_align: Clutter.ActorAlign.FILL,
            y_align: Clutter.ActorAlign.FILL,
            style: "padding-bottom: 10px; spacing: 8px;",
            style_class: 'arcmenu-margin-box'
        });
        this.applicationsScrollBox = this._createScrollBox({
            clip_to_allocation: true,
            x_expand: true,
            y_expand: true,
            x_align: Clutter.ActorAlign.FILL,
            y_align: Clutter.ActorAlign.START,
            overlay_scrollbars: true,
            style_class: this.disableFadeEffect ? '' : 'vfade',
        });
        this.applicationsScrollBox.add_actor(this.applicationsBox);
        this.subMainBox.add_child(this.applicationsScrollBox);

        this.actionsContainerBoxStyle = "margin: 0px; spacing: 0px; background-color:rgba(10, 10, 15, 0.1); padding: 12px 25px;"+
                                            "border-color: rgba(186, 196,201, 0.2); border-top-width: 1px;";
        this.themeNodeBorderRadius = "";
        this.actionsContainerBox = new St.BoxLayout({
            x_expand: true,
            y_expand: true,
            x_align: Clutter.ActorAlign.FILL,
            y_align: Clutter.ActorAlign.END,
            vertical: false,
            style: this.actionsContainerBoxStyle + this.themeNodeBorderRadius
        });

        this.subMainBox.add_child(this.actionsContainerBox);

        this.actionsBox = new St.BoxLayout({
            x_expand: true,
            y_expand: true,
            x_align: Clutter.ActorAlign.FILL,
            y_align: Clutter.ActorAlign.CENTER,
            vertical: false
        });
        this.actionsBox.style = "spacing: 10px;";
        this.appsBox = new St.BoxLayout({
            vertical: true
        });
        this.actionsContainerBox.add_child(this.actionsBox);

        this.shortcutsBox = new St.BoxLayout({
            x_expand: true,
            y_expand: true,
            x_align: Clutter.ActorAlign.FILL,
            y_align: Clutter.ActorAlign.CENTER,
            vertical: true,
            style: 'padding: 0px 25px;'
        });

        let layout = new Clutter.GridLayout({
            orientation: Clutter.Orientation.VERTICAL,
            column_spacing: 10,
            row_spacing: 5,
            column_homogeneous: true
        });
        this.shortcutsGrid = new St.Widget({
            x_expand: true,
            x_align: Clutter.ActorAlign.FILL,
            layout_manager: layout
        });
        layout.hookup_style(this.shortcutsGrid);
        layout.forceGridColumns = 2;
        this.shortcutsBox.add_child(this.shortcutsGrid);

        this.user = new MW.UserMenuItem(this, Constants.DisplayType.LIST);
        this.actionsBox.add_child(this.user);

        this.quickLinksBox = new St.BoxLayout({
            x_expand: true,
            y_expand: true,
            x_align: Clutter.ActorAlign.END,
            y_align: Clutter.ActorAlign.CENTER,
            vertical: false,
            style: 'spacing: 10px;'
        });
        let isContainedInCategory = false;
        let filesButton = this.createMenuItem([_("Files"), "", "org.gnome.Nautilus.desktop"], Constants.DisplayType.BUTTON, isContainedInCategory);
        if(filesButton.shouldShow)
            this.quickLinksBox.add_child(filesButton);

        let terminalButton = this.createMenuItem([_("Terminal"), "", "org.gnome.Terminal.desktop"], Constants.DisplayType.BUTTON, isContainedInCategory);
        this.quickLinksBox.add_child(terminalButton);

        let settingsButton = this.createMenuItem([_("Settings"),"", "org.gnome.Settings.desktop"], Constants.DisplayType.BUTTON, isContainedInCategory);
        if(settingsButton.shouldShow)
            this.quickLinksBox.add_child(settingsButton);

        this.leaveButton = new MW.LeaveButton(this);
        this.quickLinksBox.add_child(this.leaveButton);

        this.actionsBox.add_child(this.quickLinksBox);

        this.backButton = this._createNavigationButtons(_("All Apps"), MW.BackButton);
        this.allAppsButton = this._createNavigationButtons(_("Pinned"), MW.AllAppsButton);
        this.frequentAppsHeader = this._createNavigationButtons(_("Frequent"), null);

        this.updateStyle();
        this.updateWidth();
        this.loadCategories();
        this.loadPinnedApps();
        this.setDefaultMenuView();

        this.disableFrequentAppsID = this._settings.connect("changed::eleven-disable-frequent-apps", () => this.setDefaultMenuView());
    }

    loadPinnedApps(){
        this.layoutProperties.DisplayType = Constants.DisplayType.GRID;
        super.loadPinnedApps();
    }

    loadFrequentApps(){
        this.frequentAppsList = [];

        if(this._settings.get_boolean("eleven-disable-frequent-apps"))
            return;

        let labelRow = this.createLabelRow(_("Frequent"));
        this.applicationsBox.add_child(labelRow);
        let mostUsed = Shell.AppUsage.get_default().get_most_used();

        if(mostUsed.length < 1)
            return;

        for (let i = 0; i < mostUsed.length; i++) {
            if (mostUsed[i] && mostUsed[i].get_app_info().should_show()){
                let item = new MW.ApplicationMenuItem(this, mostUsed[i], Constants.DisplayType.LIST);
                this.frequentAppsList.push(item);
            }
        }

        const MaxItems = 8;
        if(this.frequentAppsList.length > MaxItems)
            this.frequentAppsList.splice(MaxItems);
    }

    setDefaultMenuView(){
        this.layoutProperties.IconGridSize = 34;
        this.setGridLayout(Constants.DisplayType.GRID, 6, 0);
        super.setDefaultMenuView();
        this.loadFrequentApps();
        this.activeCategory = _("Pinned");
        this.activeCategoryType = Constants.CategoryType.HOME_SCREEN;
        this.displayPinnedApps();
    }

    _clearActorsFromBox(box){
        super._clearActorsFromBox(box);
    }

    displayAllApps(){
        this.activeCategory = _("All Apps");
        this.activeCategoryType = Constants.CategoryType.ALL_PROGRAMS;

        this.setGridLayout(Constants.DisplayType.LIST, 1, 5);
        let appList = [];
        this.applicationsMap.forEach((value,key,map) => {
            appList.push(key);
        });
        appList.sort((a, b) => {
            return a.get_name().toLowerCase() > b.get_name().toLowerCase();
        });
        this._clearActorsFromBox();
        this._displayAppList(appList, Constants.CategoryType.ALL_PROGRAMS, this.applicationsGrid);
        this.setGridLayout(Constants.DisplayType.GRID, 6, 0, false);
    }

    updateStyle(){
        let themeNode = this.arcMenu.box.get_theme_node();
        let borderRadius = themeNode.get_length('border-radius');
        let monitorIndex = Main.layoutManager.findIndexForActor(this.menuButton);
        let scaleFactor = Main.layoutManager.monitors[monitorIndex].geometry_scale;
        borderRadius = borderRadius / scaleFactor;
        this.themeNodeBorderRadius = "border-radius: 0px 0px " + borderRadius + "px " + borderRadius + "px;";
        this.actionsContainerBox.style = this.actionsContainerBoxStyle + this.themeNodeBorderRadius;
        this.arcMenu.box.style = "padding-bottom: 0px; padding-left: 0px; padding-right: 0px;";
    }

    setGridLayout(displayType, columns, spacing, setStyle = true){
        if(setStyle){
            this.applicationsGrid.x_align = displayType === Constants.DisplayType.LIST ? Clutter.ActorAlign.FILL : Clutter.ActorAlign.CENTER;
        }
        this.applicationsGrid.layout_manager.column_spacing = spacing;
        this.applicationsGrid.layout_manager.row_spacing = spacing;
        this.layoutProperties.DisplayType = displayType;
    }

    loadCategories() {
        this.layoutProperties.DisplayType = Constants.DisplayType.LIST;
        this.categoryDirectories = null;
        this.categoryDirectories = new Map();
        this.hasPinnedApps = true;
        super.loadCategories();
    }

    displayPinnedApps() {
        this._clearActorsFromBox(this.applicationsBox);
        this.activeCategory = _("Pinned");
        this._displayAppList(this.pinnedAppsArray, Constants.CategoryType.PINNED_APPS, this.applicationsGrid);

        if(this.frequentAppsList.length > 0 && !this._settings.get_boolean("eleven-disable-frequent-apps")){
            this.activeCategory = _("Frequent");
            this.setGridLayout(Constants.DisplayType.GRID, 2, 0);
            this._displayAppList(this.frequentAppsList, Constants.CategoryType.HOME_SCREEN, this.shortcutsGrid);
            this.setGridLayout(Constants.DisplayType.GRID, 6, 0);
            if(!this.applicationsBox.contains(this.shortcutsBox))
                this.applicationsBox.add_child(this.shortcutsBox);
        }
        else if(this.applicationsBox.contains(this.shortcutsBox)){
            this.applicationsBox.remove_child(this.shortcutsBox);
        }
    }

    _displayAppList(apps, category, grid){
        super._displayAppList(apps, category, grid);

        this._hideNavigationButtons();

        if(category === Constants.CategoryType.PINNED_APPS){
            this.applicationsBox.insert_child_at_index(this.allAppsButton, 0);
        }
        else if(category === Constants.CategoryType.HOME_SCREEN){
            this.applicationsBox.insert_child_at_index(this.frequentAppsHeader, 2);
        }
        else if(category === Constants.CategoryType.ALL_PROGRAMS){
            this.mainBox.insert_child_at_index(this.backButton, 1);
        }
    }

    _hideNavigationButtons(){
        if(this.mainBox.contains(this.backButton))
            this.mainBox.remove_child(this.backButton);
    }

    _createNavigationButtons(buttonTitle, ButtonClass){
        let navButton = this.createLabelRow(buttonTitle);
        navButton.label.y_align = Clutter.ActorAlign.CENTER;
        navButton.style = 'padding: 0px 25px;'
        if(ButtonClass)
            navButton.add_child(new ButtonClass(this));
        return navButton;
    }

    _onSearchBoxChanged(searchBox, searchString){
        if(!searchBox.isEmpty())
            this._hideNavigationButtons();
        super._onSearchBoxChanged(searchBox, searchString);
    }

    destroy(){
        this.arcMenu.box.style = null;
        this.backButton.destroy();
        this.allAppsButton.destroy();
        if(this.disableFrequentAppsID){
            this._settings.disconnect(this.disableFrequentAppsID);
            this.disableFrequentAppsID = null;
        }

        super.destroy();
    }
}

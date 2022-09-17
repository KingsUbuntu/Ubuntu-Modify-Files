const Me = imports.misc.extensionUtils.getCurrentExtension();

const {Clutter, Gtk, Shell, St} = imports.gi;
const BaseMenuLayout = Me.imports.menulayouts.baseMenuLayout;
const Constants = Me.imports.constants;
const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const Main = imports.ui.main;
const MW = Me.imports.menuWidgets;
const PanelMenu = imports.ui.panelMenu;
const Utils =  Me.imports.utils;
const _ = Gettext.gettext;

var createMenu =  class extends BaseMenuLayout.BaseLayout{
    constructor(menuButton, isStandalone) {
        super(menuButton, {
            Search: true,
            DisplayType: Constants.DisplayType.LIST,
            SearchDisplayType: Constants.DisplayType.LIST,
            GridColumns: 1,
            ColumnSpacing: 0,
            RowSpacing: 0,
            VerticalMainBox: true,
            DefaultCategoryIconSize: Constants.MEDIUM_ICON_SIZE,
            DefaultApplicationIconSize: Constants.EXTRA_SMALL_ICON_SIZE,
            DefaultQuickLinksIconSize: Constants.EXTRA_SMALL_ICON_SIZE,
            DefaultButtonsIconSize: Constants.EXTRA_SMALL_ICON_SIZE,
            DefaultPinnedIconSize: Constants.EXTRA_SMALL_ICON_SIZE,
            StandaloneRunner: isStandalone
        });
    }

    createLayout(){
        super.createLayout();
        this.dummyCursor = new St.Widget({ width: 0, height: 0, opacity: 0 });
        Main.uiGroup.add_child(this.dummyCursor);
        this.updateLocation();

        //store old ArcMenu variables
        this.oldSourceActor = this.arcMenu.sourceActor;
        this.oldFocusActor = this.arcMenu.focusActor;
        this.oldArrowAlignment = this.arcMenu.actor._arrowAlignment;

        this.arcMenu.sourceActor = this.dummyCursor;
        this.arcMenu.focusActor = this.dummyCursor;
        this.arcMenu._boxPointer.setPosition(this.dummyCursor, 0.5);

        this.topBox = new St.BoxLayout({
            x_expand: true,
            y_expand: true,
            vertical: false,
            style: "margin: 5px 0px 0px 0px;"
        });
        this.runnerTweaksButton = new MW.RunnerTweaksButton(this);
        this.runnerTweaksButton.x_expand = false;
        this.runnerTweaksButton.y_expand = true;
        this.runnerTweaksButton.y_align = this.searchBox.y_align = Clutter.ActorAlign.CENTER;
        this.runnerTweaksButton.x_align = Clutter.ActorAlign.CENTER;
        this.runnerTweaksButton.style = "margin: 0px 0px 0px 6px;";

        this.topBox.add_child(this.searchBox);
        this.topBox.add_child(this.runnerTweaksButton);
        this.mainBox.add_child(this.topBox);

        this.applicationsScrollBox = this._createScrollBox({
            x_expand: true,
            y_expand: true,
            y_align: Clutter.ActorAlign.START,
            x_align: Clutter.ActorAlign.START,
            overlay_scrollbars: true,
            style_class: this.disableFadeEffect ? '' : 'small-vfade',
            reactive:true
        });

        this.mainBox.add_child(this.applicationsScrollBox);
        this.applicationsBox = new St.BoxLayout({
            vertical: true,
            style: "margin: 5px 0px 0px 0px;"
        });
        this.applicationsScrollBox.add_actor(this.applicationsBox);
        this.activeMenuItem = null;
        this.setDefaultMenuView();
    }

    setDefaultMenuView(){
        this.activeMenuItem = null;
        super.setDefaultMenuView();
        if(this._settings.get_boolean("runner-show-frequent-apps"))
            this.displayFrequentApps();
    }

    displayFrequentApps(){
        let labelRow = this.createLabelRow(_("Frequent Apps"));
        this.applicationsBox.add_child(labelRow);
        let mostUsed = Shell.AppUsage.get_default().get_most_used();
        let appList = [];
        for (let i = 0; i < mostUsed.length; i++) {
            if (mostUsed[i] && mostUsed[i].get_app_info().should_show()){
                let item = new MW.ApplicationMenuItem(this, mostUsed[i], Constants.DisplayType.LIST);
                appList.push(item);
            }
        }
        let activeMenuItemSet = false;
        for (let i = 0; i < appList.length; i++) {
            let item = appList[i];
            if(item.get_parent())
                item.get_parent().remove_child(item);
            this.applicationsBox.add_actor(item);
            if(!activeMenuItemSet){
                activeMenuItemSet = true;
                this.activeMenuItem = item;
            }
        }
    }

    /**
     * if button is hidden, menu should appear on current monitor, unless preference is to always show on primary monitor
     * @returns index of monitor where menu should appear
     */
    _getMonitorIndexForPlacement() {
        if (this.layoutProperties.StandaloneRunner) {
            return this._settings.get_boolean('runner-hotkey-open-primary-monitor') ? Main.layoutManager.primaryMonitor.index : Main.layoutManager.currentMonitor.index;
        }
        else if (this._settings.get_enum('menu-button-appearance') === Constants.MenuButtonAppearance.NONE)
            return this._settings.get_boolean('hotkey-open-primary-monitor') ? Main.layoutManager.primaryMonitor.index : Main.layoutManager.currentMonitor.index;
        else
            return Main.layoutManager.findIndexForActor(this.menuButton);
    }

    updateLocation(){
        this.arcMenu._boxPointer.setSourceAlignment(0.5);
        this.arcMenu._arrowAlignment = 0.5;

        let rect = Main.layoutManager.getWorkAreaForMonitor(this._getMonitorIndexForPlacement());

        //Position the runner menu in the center of the current monitor, at top of screen.
        let positionX = Math.round(rect.x + (rect.width / 2));
        let positionY = rect.y;
        if(this._settings.get_enum('runner-position') == 1)
            positionY = Math.round(rect.y + (rect.height / 2) - 125);
        this.dummyCursor.set_position(positionX,  positionY);

        if(!this.topBox)
            return;

        this._runnerWidth = this._settings.get_int("runner-menu-width");
        this._runnerHeight = this._settings.get_int("runner-menu-height");
        this._runnerFontSize = this._settings.get_int("runner-font-size");
        this.mainBox.style = `max-height: ${this._runnerHeight}px;`;
        if(this._runnerFontSize > 0){
            this.mainBox.style += `font-size: ${this._runnerFontSize}pt;`
            this.searchBox.style += `font-size: ${this._runnerFontSize}pt;`
        }
        this.topBox.style = `width: ${this._runnerWidth}px; margin: 5px 0px 0px 0px;`;
        this.applicationsScrollBox.style = `width: ${this._runnerWidth}px;`;
    }

    loadCategories(){
    }

    destroy(){
        this.arcMenu.sourceActor = this.oldSourceActor;
        this.arcMenu.focusActor = this.oldFocusActor;
        this.arcMenu._boxPointer.setPosition(this.oldSourceActor, this.oldArrowAlignment);
        Main.uiGroup.remove_child(this.dummyCursor);
        this.dummyCursor.destroy();
        super.destroy();
    }
}

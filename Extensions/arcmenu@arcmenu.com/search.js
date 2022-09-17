/*
 * Credits: This file leverages the work from GNOME Shell search.js file
 * (https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/js/ui/search.js)
 */
const Me = imports.misc.extensionUtils.getCurrentExtension();
const {Clutter, Gio, GLib, GObject, Shell, St } = imports.gi;
const AppDisplay = imports.ui.appDisplay;
const appSys = Shell.AppSystem.get_default();
const Constants = Me.imports.constants;
const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const { Highlighter } = imports.misc.util;
const MW = Me.imports.menuWidgets;
const { RecentFilesManager } = Me.imports.recentFilesManager;
const RemoteSearch = imports.ui.remoteSearch;
const Utils =  Me.imports.utils;
const _ = Gettext.gettext;

const { OpenWindowSearchProvider } = Me.imports.searchProviders.openWindows;
const { RecentFilesSearchProvider } = Me.imports.searchProviders.recentFiles;

const SEARCH_PROVIDERS_SCHEMA = 'org.gnome.desktop.search-providers';

var ListSearchResult = GObject.registerClass(class ArcMenu_ListSearchResult extends MW.ApplicationMenuItem{
    _init(provider, metaInfo, resultsView) {
        let menulayout = resultsView._menuLayout;
        let app = appSys.lookup_app(metaInfo['id']);

        super._init(menulayout, app, Constants.DisplayType.LIST, metaInfo)

        this.app = app;
        let layoutProperties = this._menuLayout.layoutProperties;
        this.searchType = layoutProperties.SearchDisplayType;
        this.metaInfo = metaInfo;
        this.provider = provider;
        this._settings = this._menuLayout._settings;
        this.resultsView = resultsView;
        this.layout = this._settings.get_enum('menu-layout');

        if(this.provider.id === 'org.gnome.Nautilus.desktop' || this.provider.id === 'arcmenu.recent-files')
            this.folderPath = this.metaInfo['description'];

        let highlightSearchResultTerms = this._settings.get_boolean('highlight-search-result-terms');
        if(highlightSearchResultTerms){
            this._termsChangedId = this.resultsView.connect('terms-changed', this._highlightTerms.bind(this));
            this._highlightTerms();
        }

        //Force show calculator metaInfo description even if 'show-search-result-details' off.
        //otherwise equation solution wouldn't appear.
        let showSearchResultDescriptions = this._settings.get_boolean("show-search-result-details");
        if(this.metaInfo['description'] && this.provider.appInfo.get_id() === 'org.gnome.Calculator.desktop' && !showSearchResultDescriptions){
            this.remove_child(this.label);

            let labelBox = new St.BoxLayout({
                x_expand: true,
                x_align: Clutter.ActorAlign.FILL,
                style: 'spacing: 8px;'
            });
            let descriptionText = this.metaInfo['description'].split('\n')[0];
            this.descriptionLabel = new St.Label({
                text: descriptionText,
                y_expand: true,
                y_align: Clutter.ActorAlign.CENTER,
                style: "font-weight: lighter;"
            });
            labelBox.add_child(this.label);
            labelBox.add_child(this.descriptionLabel);
            this.add_child(labelBox);
        }

        if(!this.app && this.metaInfo['description'])
            this.description = this.metaInfo['description'].split('\n')[0];
        this.connect('destroy', this._onDestroy.bind(this));
    }

    _onDestroy() {
        if (this._termsChangedId) {
            this.resultsView.disconnect(this._termsChangedId);
            this._termsChangedId = null;
        }
    }

    _highlightTerms() {
        let showSearchResultDescriptions = this._settings.get_boolean("show-search-result-details");
        if(this.descriptionLabel && showSearchResultDescriptions){
            let descriptionMarkup = this.resultsView.highlightTerms(this.metaInfo['description'].split('\n')[0]);
            this.descriptionLabel.clutter_text.set_markup(descriptionMarkup);
        }
        let labelMarkup = this.resultsView.highlightTerms(this.label.text.split('\n')[0]);
        this.label.clutter_text.set_markup(labelMarkup);
    }
});

var AppSearchResult = GObject.registerClass(class ArcMenu_AppSearchResult extends MW.ApplicationMenuItem{
    _init(provider, metaInfo, resultsView) {
        let menulayout = resultsView._menuLayout;
        let app = appSys.lookup_app(metaInfo['id']) || appSys.lookup_app(provider.id);
        let displayType = menulayout.layoutProperties.SearchDisplayType;
        super._init(menulayout, app, displayType, metaInfo);
        this.app = app;
        this.provider = provider;
        this.metaInfo = metaInfo;
        this.resultsView = resultsView;

        if(!this.app && this.metaInfo['description'])
            this.description = this.metaInfo['description'].split('\n')[0];

        let highlightSearchResultTerms = this._settings.get_boolean('highlight-search-result-terms');
        if(highlightSearchResultTerms){
            this._termsChangedId = this.resultsView.connect('terms-changed', this._highlightTerms.bind(this));
            this._highlightTerms();
        }

        this.connect('destroy', this._onDestroy.bind(this));
    }

    _onDestroy() {
        if (this._termsChangedId) {
            this.resultsView.disconnect(this._termsChangedId);
            this._termsChangedId = null;
        }
    }

    _highlightTerms() {
        let showSearchResultDescriptions = this._settings.get_boolean("show-search-result-details");
        if(this.descriptionLabel && showSearchResultDescriptions){
            let descriptionMarkup = this.resultsView.highlightTerms(this.descriptionLabel.text.split('\n')[0]);
            this.descriptionLabel.clutter_text.set_markup(descriptionMarkup);
        }

        let labelMarkup = this.resultsView.highlightTerms(this.label.text.split('\n')[0]);
        this.label.clutter_text.set_markup(labelMarkup);
    }
});

var SearchResultsBase = GObject.registerClass({
    Signals: { 'terms-changed': {},
                'no-results': {} },
}, class ArcMenu_SearchResultsBase extends St.BoxLayout {
    _init(provider, resultsView) {
        super._init({ vertical: true });
        this.provider = provider;
        this.resultsView = resultsView;
        this._menuLayout = resultsView._menuLayout;
        this._terms = [];

        this._resultDisplayBin = new St.Bin({
            x_expand: true,
            y_expand: true
        });

        this.add_child(this._resultDisplayBin);

        this._resultDisplays = {};
        this._clipboard = St.Clipboard.get_default();

        this._cancellable = new Gio.Cancellable();
        this.connect('destroy', this._onDestroy.bind(this));
    }

    _onDestroy() {
        this._terms = [];
    }

    _createResultDisplay(meta) {
        if (this.provider.createResultObject)
            return this.provider.createResultObject(meta, this.resultsView);

        return null;
    }

    clear() {
        this._cancellable.cancel();
        for (let resultId in this._resultDisplays)
            this._resultDisplays[resultId].destroy();
        this._resultDisplays = {};
        this._clearResultDisplay();
        this.hide();
    }

    _setMoreCount(count) {
    }

    _ensureResultActors(results, callback) {
        let metasNeeded = results.filter(
            resultId => this._resultDisplays[resultId] === undefined
        );

        if (metasNeeded.length === 0) {
            callback(true);
        } else {
            this._cancellable.cancel();
            this._cancellable.reset();

            this.provider.getResultMetas(metasNeeded, metas => {
                if (this._cancellable.is_cancelled()) {
                    if (metas.length > 0)
                        log(`Search provider ${this.provider.id} returned results after the request was canceled`);
                    callback(false);
                    return;
                }
                if (metas.length != metasNeeded.length) {
                    log('Wrong number of result metas returned by search provider ' + this.provider.id +
                        ': expected ' + metasNeeded.length + ' but got ' + metas.length);
                    callback(false);
                    return;
                }
                if (metas.some(meta => !meta.name || !meta.id)) {
                    log('Invalid result meta returned from search provider ' + this.provider.id);
                    callback(false);
                    return;
                }

                metasNeeded.forEach((resultId, i) => {
                    let meta = metas[i];
                    let display = this._createResultDisplay(meta);
                    this._resultDisplays[resultId] = display;
                });
                callback(true);
            }, this._cancellable);
        }
    }

    updateSearch(providerResults, terms, callback) {
        this._terms = terms;
        if (providerResults.length == 0) {
            this._clearResultDisplay();
            this.hide();
            callback();
        } else {
            let maxResults = this._getMaxDisplayedResults();
            let results = maxResults > -1
                ? this.provider.filterResults(providerResults, maxResults)
                : providerResults;

            let moreCount = Math.max(providerResults.length - results.length, 0);

            this._ensureResultActors(results, successful => {
                if (!successful) {
                    this._clearResultDisplay();
                    callback();
                    return;
                }

                // To avoid CSS transitions causing flickering when
                // the first search result stays the same, we hide the
                // content while filling in the results.
                this.hide();
                this._clearResultDisplay();
                results.forEach(resultId => {
                    this._addItem(this._resultDisplays[resultId]);
                });

                this._setMoreCount(this.provider.canLaunchSearch ? moreCount : 0);
                this.show();
                callback();
            });
        }
    }
});

var ListSearchResults = GObject.registerClass(
class ArcMenu_ListSearchResults extends SearchResultsBase {
    _init(provider, resultsView) {
        super._init(provider, resultsView);
        this._menuLayout = resultsView._menuLayout;
        this.searchType = this._menuLayout.layoutProperties.SearchDisplayType;
        this._settings = this._menuLayout._settings;
        this.layout = this._settings.get_enum('menu-layout');

        this._container = new St.BoxLayout({
            vertical: true,
            x_align: Clutter.ActorAlign.FILL,
            y_align: Clutter.ActorAlign.FILL,
            x_expand: true,
            y_expand: true,
        });

        this.providerInfo = new ArcSearchProviderInfo(provider, this._menuLayout);
        this.providerInfo.connect('activate', () => {
            if (provider.canLaunchSearch) {
                provider.launchSearch(this._terms);
                this._menuLayout.arcMenu.toggle();
            }
        });

        this._container.add_child(this.providerInfo);

        this._content = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            y_expand: true,
            x_align: Clutter.ActorAlign.FILL
        });

        this._container.add_child(this._content);
        this._resultDisplayBin.set_child(this._container);
    }

    _setMoreCount(count) {
        this.providerInfo.setMoreCount(count);
    }

    _getMaxDisplayedResults() {
        return this._settings.get_int('max-search-results');
    }

    _clearResultDisplay() {
        this._content.remove_all_children();
    }

    _createResultDisplay(meta) {
        return super._createResultDisplay(meta, this.resultsView) ||
               new ListSearchResult(this.provider, meta, this.resultsView);
    }

    _addItem(display) {
        if(display.get_parent())
            display.get_parent().remove_child(display);
        this._content.add_child(display);
    }

    getFirstResult() {
        if (this._content.get_n_children() > 0)
            return this._content.get_child_at_index(0)._delegate;
        else
            return null;
    }
});

var AppSearchResults = GObject.registerClass(
class ArcMenu_AppSearchResults extends SearchResultsBase {
    _init(provider, resultsView) {
        super._init(provider, resultsView);
        this._parentContainer = resultsView;
        this._menuLayout = resultsView._menuLayout;
        this._settings = this._menuLayout._settings;
        this.layoutProperties = this._menuLayout.layoutProperties;
        this.searchType = this.layoutProperties.SearchDisplayType;
        this.layout = this._menuLayout._settings.get_enum('menu-layout');

        this.itemCount = 0;
        this.gridTop = -1;
        this.gridLeft = 0;

        this.rtl = this._menuLayout.mainBox.get_text_direction() == Clutter.TextDirection.RTL;

        let layout = new Clutter.GridLayout({
            orientation: Clutter.Orientation.VERTICAL,
            column_spacing: this.searchType === Constants.DisplayType.GRID ? this.layoutProperties.ColumnSpacing : 0,
            row_spacing: this.searchType === Constants.DisplayType.GRID ? this.layoutProperties.RowSpacing : 0,
        });
        this._grid = new St.Widget({
            x_expand: true,
            x_align: this.searchType === Constants.DisplayType.LIST ? Clutter.ActorAlign.FILL : Clutter.ActorAlign.CENTER,
            layout_manager: layout
        });
        layout.hookup_style(this._grid);

        if(this.searchType === Constants.DisplayType.GRID){
            let spacing = this.layoutProperties.ColumnSpacing;

            this._grid.style = "padding: 0px 0px 10px 0px; spacing: " + spacing + "px;";
            this._resultDisplayBin.x_align = Clutter.ActorAlign.CENTER;
        }

        this._resultDisplayBin.set_child(this._grid);
    }

    _getMaxDisplayedResults() {
        let maxDisplayedResults;
        if(this.searchType === Constants.DisplayType.GRID)
            maxDisplayedResults = this._menuLayout.getColumnsFromGridIconSizeSetting();
        else
            maxDisplayedResults = this._settings.get_int('max-search-results');
        return maxDisplayedResults;
    }

    _clearResultDisplay() {
        this.itemCount = 0;
        this.gridTop = -1;
        this.gridLeft = 0;
        this._grid.remove_all_children();
    }

    _createResultDisplay(meta) {
        return new AppSearchResult(this.provider, meta, this.resultsView);
    }

    _addItem(display) {
        const GridColumns = this.searchType === Constants.DisplayType.LIST ? 1 : this._menuLayout.getColumnsFromGridIconSizeSetting();
        if(!this.rtl && (this.itemCount % GridColumns === 0)){
            this.gridTop++;
            this.gridLeft = 0;
        }
        else if(this.rtl && (this.gridLeft === 0)){
            this.gridTop++;
            this.gridLeft = GridColumns;
        }
        this._grid.layout_manager.attach(display, this.gridLeft, this.gridTop, 1, 1);
        display.gridLocation = [this.gridLeft, this.gridTop];

        if(!this.rtl)
            this.gridLeft++;
        else if(this.rtl)
            this.gridLeft--;
        this.itemCount++;
    }

    getFirstResult() {
        if (this._grid.get_n_children() > 0)
            return this._grid.get_child_at_index(0)._delegate;
        else
            return null;
    }
});

var SearchResults = GObject.registerClass({
    Signals: { 'terms-changed': {},
                'have-results': {},
                'no-results': {} },
}, class ArcMenu_SearchResults extends St.BoxLayout {
    _init(menuLayout) {
        super._init({
            vertical: true,
            y_expand: true,
            x_expand: true,
            x_align: Clutter.ActorAlign.FILL
        });
        this._menuLayout = menuLayout;
        this.layoutProperties = this._menuLayout.layoutProperties;
        this.searchType = this.layoutProperties.SearchDisplayType;
        this._settings = this._menuLayout._settings;
        this.layout = this._settings.get_enum('menu-layout');

        this._content = new St.BoxLayout({
            vertical: true,
            x_align: Clutter.ActorAlign.FILL
        });

        this.add_child(this._content);

        this._statusText = new St.Label();
        this._statusBin = new St.Bin({
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            y_expand: true
        });

        this.add_child(this._statusBin);
        this._statusBin.set_child(this._statusText);

        this._highlightDefault = true;
        this._defaultResult = null;
        this._startingSearch = false;

        this._terms = [];
        this._results = {};

        this._providers = [];

        this._highlighter = new Highlighter();

        this.recentFilesManager = new RecentFilesManager();

        this._searchSettings = new Gio.Settings({ schema_id: SEARCH_PROVIDERS_SCHEMA });
        this.disabledID = this._searchSettings.connect('changed::disabled', this._reloadRemoteProviders.bind(this));
        this.enabledID =  this._searchSettings.connect('changed::enabled', this._reloadRemoteProviders.bind(this));
        this.disablExternalID = this._searchSettings.connect('changed::disable-external', this._reloadRemoteProviders.bind(this));
        this.sortOrderID = this._searchSettings.connect('changed::sort-order', this._reloadRemoteProviders.bind(this));

        this._searchTimeoutId = null;
        this._cancellable = new Gio.Cancellable();

        this._registerProvider(new AppDisplay.AppSearchProvider());

        this.installChangedID = appSys.connect('installed-changed', this._reloadRemoteProviders.bind(this));

        this._reloadRemoteProviders();

        this.connect('destroy', this._onDestroy.bind(this));
    }

    get terms() {
        return this._terms;
    }

    setStyle(style){
        if(this._statusText){
            this._statusText.style_class = style;
        }
    }

    _onDestroy(){
        this._terms = [];
        this._results = {};
        this._clearDisplay();
        this._clearSearchTimeout();
        this._defaultResult = null;
        this._startingSearch = false;
        if(this.disabledID){
            this._searchSettings.disconnect(this.disabledID);
            this.disabledID = null;
        }
        if(this.enabledID){
            this._searchSettings.disconnect(this.enabledID);
            this.enabledID = null;
        }
        if(this.disablExternalID){
            this._searchSettings.disconnect(this.disablExternalID);
            this.disablExternalID = null;
        }
        if(this.sortOrderID){
            this._searchSettings.disconnect(this.sortOrderID);
            this.sortOrderID = null;
        }
        if(this.installChangedID){
            appSys.disconnect(this.installChangedID);
            this.installChangedID = null;
        }
        let remoteProviders = this._providers.filter(p => p.isRemoteProvider);
        remoteProviders.forEach(provider => {
            this._unregisterProvider(provider);
        });

        this.recentFilesManager.destroy();
        this.recentFilesManager = null;
    }

    _reloadRemoteProviders() {
        let currentTerms = this._terms;
        //cancel any active search
        if (this._terms.length !== 0)
            this._reset();

        this._oldProviders = null;
        let remoteProviders = this._providers.filter(p => p.isRemoteProvider);

        remoteProviders.forEach(provider => {
            this._unregisterProvider(provider);
        });

        if(this._settings.get_boolean('search-provider-open-windows'))
            this._registerProvider(new OpenWindowSearchProvider());
        if(this._settings.get_boolean('search-provider-recent-files'))
            this._registerProvider(new RecentFilesSearchProvider(this.recentFilesManager));

        RemoteSearch.loadRemoteSearchProviders(this._searchSettings, providers => {
            providers.forEach(this._registerProvider.bind(this));
        });

        //restart any active search
        if(currentTerms.length > 0)
            this.setTerms(currentTerms);
    }

    _registerProvider(provider) {
        provider.searchInProgress = false;
        this._providers.push(provider);
        this._ensureProviderDisplay(provider);
    }

    _unregisterProvider(provider) {
        let index = this._providers.indexOf(provider);
        this._providers.splice(index, 1);

        if (provider.display){
            provider.display.destroy();
        }
    }

    _gotResults(results, provider) {
        this._results[provider.id] = results;
        this._updateResults(provider, results);
    }

    _clearSearchTimeout() {
        if (this._searchTimeoutId) {
            GLib.source_remove(this._searchTimeoutId);
            this._searchTimeoutId = null;
        }
    }

    _reset() {
        this._terms = [];
        this._results = {};
        this._clearDisplay();
        this._clearSearchTimeout();
        this._defaultResult = null;
        this._startingSearch = false;

        this._updateSearchProgress();
    }

    _doSearch() {
        this._startingSearch = false;

        let previousResults = this._results;
        this._results = {};

        this._providers.forEach(provider => {
            provider.searchInProgress = true;

            let previousProviderResults = previousResults[provider.id];
            if (this._isSubSearch && previousProviderResults)
                provider.getSubsearchResultSet(previousProviderResults,
                                               this._terms,
                                               results => {
                                                   this._gotResults(results, provider);
                                               },
                                               this._cancellable);
            else
                provider.getInitialResultSet(this._terms,
                                             results => {
                                                 this._gotResults(results, provider);
                                             },
                                             this._cancellable);
        });

        this._updateSearchProgress();

        this._clearSearchTimeout();
    }

    _onSearchTimeout() {
        this._searchTimeoutId = null;
        this._doSearch();
        return GLib.SOURCE_REMOVE;
    }

    setTerms(terms) {
        // Check for the case of making a duplicate previous search before
        // setting state of the current search or cancelling the search.
        // This will prevent incorrect state being as a result of a duplicate
        // search while the previous search is still active.
        let searchString = terms.join(' ');
        let previousSearchString = this._terms.join(' ');
        if (searchString == previousSearchString)
            return;

        this._startingSearch = true;

        this.recentFilesManager.cancelCurrentQueries();

        this._cancellable.cancel();
        this._cancellable.reset();

        if (terms.length == 0) {
            this._reset();
            return;
        }

        let isSubSearch = false;
        if (this._terms.length > 0)
            isSubSearch = searchString.indexOf(previousSearchString) == 0;

        this._terms = terms;
        this._isSubSearch = isSubSearch;
        this._updateSearchProgress();

        if (this._searchTimeoutId === null)
            this._searchTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 150, this._onSearchTimeout.bind(this));

        this._highlighter = new Highlighter(this._terms);

        this.emit('terms-changed');
    }

    _ensureProviderDisplay(provider) {
        if (provider.display)
            return;

        let providerDisplay;
        if (provider.appInfo)
            providerDisplay = new ListSearchResults(provider, this);
        else
            providerDisplay = new AppSearchResults(provider, this);
        providerDisplay.hide();
        this._content.add_child(providerDisplay);
        provider.display = providerDisplay;
    }

    _clearDisplay() {
        this._providers.forEach(provider => {
            provider.display.clear();
        });
    }

    _maybeSetInitialSelection() {
        let newDefaultResult = null;

        let providers = this._providers;
        for (let i = 0; i < providers.length; i++) {
            let provider = providers[i];
            let display = provider.display;

            if (!display.visible)
                continue;

            let firstResult = display.getFirstResult();
            if (firstResult) {
                newDefaultResult = firstResult;
                break; // select this one!
            }
        }

        if (newDefaultResult !== this._defaultResult) {
            this._setSelected(this._defaultResult, false);
            this._setSelected(newDefaultResult, this._highlightDefault);

            this._defaultResult = newDefaultResult;
        }
    }

    get searchInProgress() {
        if (this._startingSearch)
            return true;

        return this._providers.some(p => p.searchInProgress);
    }

    _updateSearchProgress() {
        let haveResults = this._providers.some(provider => {
            let display = provider.display;
            return (display.getFirstResult() != null);
        });

        this._statusBin.visible = !haveResults;
        if (haveResults)
            this.emit("have-results")
        else if (!haveResults) {
            if (this.searchInProgress)
                this._statusText.set_text(_("Searching..."));
            else
                this._statusText.set_text(_("No results."));

            this.emit("no-results")
        }
    }

    _updateResults(provider, results) {
        let terms = this._terms;
        let display = provider.display;
        display.updateSearch(results, terms, () => {
            provider.searchInProgress = false;

            this._maybeSetInitialSelection();
            this._updateSearchProgress();
        });
    }

    highlightDefault(highlight) {
        this._highlightDefault = highlight;
        this._setSelected(this._defaultResult, highlight);
    }

    getTopResult(){
        return this._defaultResult;
    }

    _setSelected(result, selected) {
        if(!result)
            return;

        if(selected && !result.has_style_pseudo_class('active'))
            result.add_style_pseudo_class('active');
        else if(!selected)
            result.remove_style_pseudo_class('active');
    }

    hasActiveResult(){
        return (this._defaultResult ? true : false) && this._highlightDefault;
    }

    highlightTerms(description) {
        if (!description)
            return '';

        return this._highlighter.highlight(description);
    }
});

var ArcSearchProviderInfo = GObject.registerClass(class ArcMenu_ArcSearchProviderInfo extends MW.ArcMenuPopupBaseMenuItem{
    _init(provider, menuLayout) {
        super._init(menuLayout);
        this.provider = provider;
        this._menuLayout = menuLayout;
        this._settings = this._menuLayout._settings;

        this.description = this.provider.appInfo.get_description();
        if(this.description)
            this.description = this.description.split('\n')[0];

        this.label = new St.Label({
            text: provider.appInfo.get_name(),
            x_align: Clutter.ActorAlign.START,
            y_align: Clutter.ActorAlign.CENTER,
            style: 'text-align: left;'
        });

        this.label.style = 'font-weight: bold;';
        this.style = "padding: 10px 12px;";
        this.add_child(this.label);

        this._moreText = "";
    }

    setMoreCount(count) {
        this._moreText = ngettext("%d more", "%d more", count).format(count);

        if(count > 0)
            this.label.text = this.provider.appInfo.get_name() + "  (" + this._moreText + ")";
        else
            this.label.text = this.provider.appInfo.get_name();
    }
});
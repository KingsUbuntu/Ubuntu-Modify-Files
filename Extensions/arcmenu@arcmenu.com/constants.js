const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

var SearchbarLocation = {
    BOTTOM: 0,
    TOP: 1
}

var MenuItemLocation = {
    BOTTOM: 0,
    TOP: 1
}

var DisplayType = {
    LIST: 0,
    GRID: 1,
    BUTTON: 2
}

var AvatarStyle = {
    ROUND: 0,
    SQUARE: 1
}

var CategoryType = {
    FAVORITES: 0,
    FREQUENT_APPS: 1,
    ALL_PROGRAMS: 2,
    PINNED_APPS: 3,
    RECENT_FILES: 4,
    HOME_SCREEN: 5,
    SEARCH_RESULTS: 6,
    CATEGORIES_LIST: 7,
};

var DefaultMenuView = {
    PINNED_APPS: 0,
    CATEGORIES_LIST: 1,
    FREQUENT_APPS: 2,
    ALL_PROGRAMS: 3
}

var PrefsVisiblePage = {
    MAIN: 0,
    MENU_LAYOUT: 1,
    BUTTON_APPEARANCE: 2,
    LAYOUT_TWEAKS: 3,
    ABOUT: 4,
    CUSTOMIZE_MENU: 5,
    RUNNER_TWEAKS: 6,
    GENERAL: 7,
    MENU_THEME: 8
}

var DefaultMenuViewTognee = {
    CATEGORIES_LIST: 0,
    ALL_PROGRAMS: 1
}

var SoftwareManagerIDs = ['org.manjaro.pamac.manager.desktop', 'pamac-manager.desktop', 'io.elementary.appcenter.desktop',
                            'snap-store_ubuntu-software.desktop', 'snap-store_snap-store.desktop', 'org.gnome.Software.desktop'];

var Categories = [
    {CATEGORY: CategoryType.FAVORITES, NAME: _("Favorites"), ICON: 'emblem-favorite-symbolic'},
    {CATEGORY: CategoryType.FREQUENT_APPS, NAME: _("Frequent Apps"), ICON: 'user-bookmarks-symbolic'},
    {CATEGORY: CategoryType.ALL_PROGRAMS, NAME: _("All Apps"), ICON: 'view-grid-symbolic'},
    {CATEGORY: CategoryType.PINNED_APPS, NAME: _("Pinned Apps"), ICON: 'view-pin-symbolic'},
    {CATEGORY: CategoryType.RECENT_FILES, NAME: _("Recent Files"), ICON: 'document-open-recent-symbolic'}
]

var TooltipLocation = {
    TOP_CENTERED: 0,
    BOTTOM_CENTERED: 1,
    BOTTOM: 2,
};

var ContextMenuLocation = {
    DEFAULT: 0,
    BOTTOM_CENTERED: 1,
    RIGHT: 2,
};

var SeparatorAlignment = {
    VERTICAL: 0,
    HORIZONTAL: 1
};

var SeparatorStyle = {
    SHORT: 0,
    MEDIUM: 1,
    LONG: 2,
    MAX: 3,
    HEADER_LABEL: 4,
    NORMAL: 5,
    ALWAYS_SHOW: 6,
};

var CaretPosition = {
    END: -1,
    START: 0,
    MIDDLE: 2,
};

var CategoryIconType = {
    FULL_COLOR: 0,
    SYMBOLIC: 1,
}

var ForcedMenuLocation = {
    OFF: 0,
    TOP_CENTERED: 1,
    BOTTOM_CENTERED: 2,
}

var IconSize = {
    DEFAULT: 0,
    EXTRA_SMALL: 1,
    SMALL: 2,
    MEDIUM: 3,
    LARGE: 4,
    EXTRA_LARGE: 5,
}

var GridIconSize = {
    DEFAULT: 0,
    SMALL: 1,
    MEDIUM: 2,
    LARGE: 3,
    SMALL_RECT: 4,
    MEDIUM_RECT: 5,
    LARGE_RECT: 6,
};

var GridIconInfo = [
    { NAME: 'SmallIconGrid', SIZE: 90, ICON_SIZE: 36, ENUM: GridIconSize.SMALL },
    { NAME: 'MediumIconGrid', SIZE: 97, ICON_SIZE: 42, ENUM: GridIconSize.MEDIUM },
    { NAME: "LargeIconGrid", SIZE: 105, ICON_SIZE: 52, ENUM: GridIconSize.LARGE },
    { NAME: 'SmallRectIconGrid', SIZE: 95, ICON_SIZE: 28, ENUM: GridIconSize.SMALL_RECT },
    { NAME: 'MediumRectIconGrid', SIZE: 102, ICON_SIZE: 34, ENUM: GridIconSize.MEDIUM_RECT },
    { NAME: 'LargeRectIconGrid', SIZE: 105, ICON_SIZE: 42, ENUM: GridIconSize.LARGE_RECT },
]

var EXTRA_SMALL_ICON_SIZE = 16;
var SMALL_ICON_SIZE = 20;
var MEDIUM_ICON_SIZE = 25;
var LARGE_ICON_SIZE = 30;
var EXTRA_LARGE_ICON_SIZE = 35;
var MISC_ICON_SIZE = 24;

var SUPER_L = 'Super_L';
var SUPER_R = 'Super_R';
var EMPTY_STRING = '';

var HotKey = {
    UNDEFINED: 0,
    SUPER_L: 1,
    CUSTOM: 2,
    // Inverse mapping
    0: EMPTY_STRING,
    1: SUPER_L,
};

var RunnerHotKey = {
    SUPER_L: 0,
    CUSTOM: 1,
    0: SUPER_L,
};

var SECTIONS = [
    'devices',
    'network',
    'bookmarks',
];

var MenuPosition = {
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2
};

var RavenPosition = {
    LEFT: 0,
    RIGHT: 1
};

var DiaglogType = {
    DEFAULT: 0,
    OTHER: 1,
    APPLICATIONS: 2,
    DIRECTORIES: 3
};

var MenuSettingsListType = {
    PINNED_APPS: 0,
    APPLICATIONS: 1,
    DIRECTORIES: 2,
    OTHER: 3,
    POWER_OPTIONS: 4,
    EXTRA_CATEGORIES: 5,
    QUICK_LINKS: 6
};

var MenuButtonAppearance = {
    ICON: 0,
    TEXT: 1,
    ICON_TEXT: 2,
    TEXT_ICON: 3,
    NONE: 4
};

var MenuIcon = {
    ARCMENU_ICON: 0,
    DISTRO_ICON: 1,
    CUSTOM: 2
};

var PowerType = {
    LOGOUT: 0,
    LOCK: 1,
    RESTART: 2,
    POWER_OFF: 3,
    SUSPEND: 4,
    HYBRID_SLEEP: 5,
    HIBERNATE: 6,
};

var PowerOptions = [
    { TYPE: PowerType.LOGOUT, ICON: 'system-log-out-symbolic', NAME: _("Log Out") },
    { TYPE: PowerType.LOCK, ICON: 'changes-prevent-symbolic', NAME: _("Lock") },
    { TYPE: PowerType.RESTART, ICON: 'system-reboot-symbolic', NAME: _("Restart") },
    { TYPE: PowerType.POWER_OFF, ICON: 'system-shutdown-symbolic', NAME: _("Power Off") },
    { TYPE: PowerType.SUSPEND, ICON: 'media-playback-pause-symbolic', NAME: _("Suspend") },
    { TYPE: PowerType.HYBRID_SLEEP, ICON: 'weather-clear-night-symbolic', NAME: _("Hybrid Sleep") },
    { TYPE: PowerType.HIBERNATE, ICON: 'document-save-symbolic', NAME: _("Hibernate") },
];

var MenuIcons = [
    { PATH: '/media/icons/menu_button_icons/icons/arcmenu-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/arcmenu-logo-alt-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/arc-menu-old-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/arc-menu-alt-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/arc-menu-old2-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/curved-a-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/focus-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/triple-dash-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/whirl-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/whirl-circle-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/sums-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/arrow-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/lins-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/diamond-square-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/octo-maze-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/search-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/transform-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/3d-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/alien-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/cloud-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/dragon-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/fly-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/pacman-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/peaks-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/pie-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/pointer-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/toxic-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/tree-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/zegon-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/apps-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/bug-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/cita-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/dragonheart-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/eclipse-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/football-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/heddy-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/helmet-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/palette-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/peeks-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/record-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/saucer-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/step-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/vancer-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/vibe-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/start-box-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/dimond-win-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/dolphin-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/dota-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/football2-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/loveheart-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/pyrimid-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/rewind-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/snap-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/time-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/3D-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/a-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/app-launcher-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/bat-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/dra-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/equal-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/gnacs-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/groove-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/kaaet-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/launcher-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/pac-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/robots-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/sheild-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/somnia-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/utool-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/swirl-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/icons/round-symbolic.svg'},
]

var DistroIcons = [
    { PATH: 'start-here-symbolic'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/debian-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/fedora-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/manjaro-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/pop-os-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/ubuntu-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/arch-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/opensuse-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/raspbian-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/kali-linux-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/pureos-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/solus-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/budgie-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/gentoo-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/mx-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/redhat-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/voyager-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/zorin-logo-symbolic.svg'},
    { PATH: '/media/icons/menu_button_icons/distro_icons/endeavour-logo-symbolic.svg'},
]

var MenuLayout = {
    ARCMENU: 0,
    BRISK: 1,
    WHISKER: 2,
    GNOME_MENU: 3,
    MINT: 4,
    ELEMENTARY: 5,
    GNOME_OVERVIEW: 6,
    REDMOND: 7,
    UNITY: 8,
    BUDGIE: 9,
    INSIDER: 10,
    RUNNER: 11,
    CHROMEBOOK: 12,
    RAVEN: 13,
    TOGNEE: 14,
    PLASMA: 15,
    WINDOWS: 16,
    ELEVEN: 17,
    AZ: 18,
};

var TraditionalMenus = [
    { IMAGE: 'arcmenu-layout-symbolic', TITLE: _('ArcMenu'), LAYOUT: MenuLayout.ARCMENU},
    { IMAGE: 'brisk-layout-symbolic', TITLE: _('Brisk'), LAYOUT: MenuLayout.BRISK},
    { IMAGE: 'whisker-layout-symbolic', TITLE: _('Whisker'), LAYOUT: MenuLayout.WHISKER},
    { IMAGE: 'gnomemenu-layout-symbolic', TITLE: _('GNOME Menu'), LAYOUT: MenuLayout.GNOME_MENU},
    { IMAGE: 'mint-layout-symbolic', TITLE: _('Mint'), LAYOUT: MenuLayout.MINT},
    { IMAGE: 'budgie-layout-symbolic', TITLE: _('Budgie'), LAYOUT: MenuLayout.BUDGIE}];

var ModernMenus = [
    { IMAGE: 'unity-layout-symbolic', TITLE: _('Unity'), LAYOUT: MenuLayout.UNITY},
    { IMAGE: 'plasma-layout-symbolic', TITLE: _('Plasma'), LAYOUT: MenuLayout.PLASMA},
    { IMAGE: 'tognee-layout-symbolic', TITLE: _('tognee'), LAYOUT: MenuLayout.TOGNEE},
    { IMAGE: 'insider-layout-symbolic', TITLE: _('Insider'), LAYOUT: MenuLayout.INSIDER},
    { IMAGE: 'redmond-layout-symbolic', TITLE: _('Redmond'), LAYOUT: MenuLayout.REDMOND},
    { IMAGE: 'windows-layout-symbolic', TITLE: _('Windows'), LAYOUT: MenuLayout.WINDOWS},
    { IMAGE: 'eleven-layout-symbolic', TITLE: _('11'), LAYOUT: MenuLayout.ELEVEN},
    { IMAGE: 'az-layout-symbolic', TITLE: _('a.z.'), LAYOUT: MenuLayout.AZ}];

var TouchMenus = [
    { IMAGE: 'elementary-layout-symbolic', TITLE: _('Elementary'), LAYOUT: MenuLayout.ELEMENTARY},
    { IMAGE: 'chromebook-layout-symbolic', TITLE: _('Chromebook'), LAYOUT: MenuLayout.CHROMEBOOK}];

var LauncherMenus = [
    { IMAGE: 'runner-layout-symbolic', TITLE: _('Runner'), LAYOUT: MenuLayout.RUNNER},
    { IMAGE: 'gnomeoverview-layout-symbolic', TITLE: _('GNOME Overview'), LAYOUT: MenuLayout.GNOME_OVERVIEW}];

var AlternativeMenus = [
    { IMAGE: 'raven-layout-symbolic', TITLE: _('Raven'), LAYOUT: MenuLayout.RAVEN}];

var MenuStyles = {
    STYLES: [
        { IMAGE: 'traditional-category-symbolic', TITLE: _("Traditional"), MENU_TYPE: TraditionalMenus },
        { IMAGE: 'modern-category-symbolic', TITLE: _("Modern"), MENU_TYPE: ModernMenus },
        { IMAGE: 'touch-category-symbolic', TITLE: _("Touch"), MENU_TYPE: TouchMenus },
        { IMAGE: 'launcher-category-symbolic', TITLE: _("Launcher"), MENU_TYPE: LauncherMenus },
        { IMAGE: 'alternative-category-symbolic', TITLE: _("Alternative"), MENU_TYPE: AlternativeMenus }
    ]
};

var ArcMenuSettingsCommand = 'gnome-extensions prefs arcmenu@arcmenu.com';

var DistroIconsDisclaimer = '<i>"All brand icons are trademarks of their respective owners. The use of these trademarks does not indicate endorsement of the trademark holder by ArcMenu project, nor vice versa. Please do not use brand logos for any purpose except to represent the company, product, or service to which they refer."</i>'+
                                '\n\n•   <b>Ubuntu®</b> - Ubuntu name and Ubuntu logo are trademarks of Canonical© Ltd.'+
                                '\n\n•   <b>Fedora®</b> - Fedora and the Infinity design logo are trademarks of Red Hat, Inc.'+
                                '\n\n•   <b>Debian®</b> - is a registered trademark owned by Software in the Public Interest, Inc. Debian trademark is a registered United States trademark of Software in the Public Interest, Inc., managed by the Debian project.'+
                                '\n\n•   <b>Manjaro®</b> - logo and name are trademarks of Manjaro GmbH &amp; Co. KG'+
                                '\n\n•   <b>Pop_OS!®</b> - logo and name are trademarks of system 76© Inc.'+
                                '\n\n•   <b>Arch Linux™</b> - The stylized Arch Linux logo is a recognized trademark of Arch Linux, copyright 2002–2017 Judd Vinet and Aaron Griffin.'+
                                '\n\n•   <b>openSUSE®</b> - logo and name 2001–2020 SUSE LLC, © 2005–2020 openSUSE Contributors &amp; others.'+
                                '\n\n•   <b>Raspberry Pi®</b> - logo and name are part of Raspberry Pi Foundation UK Registered Charity 1129409'+
                                '\n\n•   <b>Kali Linux™</b> - logo and name are part of © OffSec Services Limited 2020'+
                                '\n\n•   <b>PureOS</b> - logo and name are developed by members of the Purism community'+
                                '\n\n•   <b>Solus</b> - logo and name are copyright © 2014–2018 by Solus Project'+
                                '\n\n•   <b>Gentoo Authors©</b> - 2001–2020 Gentoo is a trademark of the Gentoo Foundation, Inc.'+
                                '\n\n•   <b>Voyager© Linux</b> - name and logo'+
                                '\n\n•   <b>MX Linux©</b> - 2020 - Linux - is the registered trademark of Linus Torvalds in the U.S. and other countries.'+
                                '\n\n•   <b>Red Hat, Inc.©</b> - Copyright 2020 name and logo' +
                                '\n\n•   <b>ZORIN OS</b> - The "Z" logomark is a registered trademark of Zorin Technology Group Ltd. Copyright © 2019 - 2021 Zorin Technology Group Ltd';

var DEVELOPERS = '<b><a href="https://gitlab.com/AndrewZaech">@AndrewZaech</a></b> - Current ArcMenu Maintainer and Developer' +
                '\n\n<b><a href="https://gitlab.com/LinxGem33">@AndyC</a></b> - ArcMenu Founder, Former Maintainer, Digital Art Designer';
var CONTRIBUTORS = '<b>Thank you to all contributors and translators</b>\n\n' +
                    '<b><a href="https://gitlab.com/arcmenu/ArcMenu#contributors">Contributors</a></b> - ' +
                    '<b><a href="https://gitlab.com/arcmenu/ArcMenu#translators">Translators</a></b>';
var ARTWORK = '<b>ArcMenu Artwork</b>\n\n' +
                '<b><a href="https://gitlab.com/LinxGem33">@AndyC</a></b> - Majority of icons in ArcMenu and Settings, plus other ArcMenu Assets' +
                '\n\n<b><a href="https://gitlab.com/AndrewZaech">@AndrewZaech</a></b> - Some ArcMenu and Settings Icons';

var GNU_SOFTWARE = '<span size="small">' +
    'This program comes with absolutely no warranty.\n' +
    'See the <a href="https://gnu.org/licenses/old-licenses/gpl-2.0.html">' +
    'GNU General Public License, version 2 or later</a> for details.' +
    '</span>';

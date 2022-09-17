<h1 align="center">
  <b>Customize Ubuntu 22.04 LTS</b>
</h1>

<p align="center">
  <img src="./resources/extras/logo_readme.jpg" alt="TeamUltroid Logo">
</p>

## **Initial Setup**

- **Update ubuntu system - `sudo apt update && sudo apt upgrade -y`**

- **Install GNOME-Tweak - `sudo apt install gnome-tweaks`**



Download Resource
Download resource : https://www.pling.com/p/1805660/

Install GTK Theme
Download https://github.com/vinceliuice/WhiteSur-gtk-theme
./install.sh -t redInstall Icon Theme

Download https://github.com/yeyushengfan258/Reversal-icon-theme
./install.sh -red

Install Fonts
Download and Extract font to ~./local/share/fonts

Install Cursors
Download https://github.com/vinceliuice/Vimix-cursors

Download and Extract, enter to directory Vimix-cursors:
./install.sh

Create folder ~./icons. move folder ~./local/share/icons/Vimic-cursors to ~./icons

Install GNOME Extensions
Restore our GNOME Extensions backup
Extract extensions.zip then copy/move all gnome extensions inside folder extensions to
~/.local/share/gnome-shell/extensions

Install from extension.gnome.org
•User Themes : https://extensions.gnome.org/extension/19/user-themes/
•ArcMenu : https://extensions.gnome.org/extension/3628/arcmenu/
•Blur my Shell : https://extensions.gnome.org/extension/3193/blur-my-shell/
•Dash to Panel : https://extensions.gnome.org/extension/1160/dash-to-panel/
•GSConnect : https://extensions.gnome.org/extension/1319/gsconnect/
•media-controls : https://github.com/programmer-pony/media-controls
•Coverflow Alt-Tab : https://extensions.gnome.org/extension/97/coverflow-alt-tab/
•Restore dconf - dconf load /org/gnome/shell/extensions/ < ~/<backupfile>

  Apply Themes, Icons, Fonts, Cursors
Open GNOME Tweaks Tools

  Change Themes, Icons, Fonts, Cursors
Theme : Vimix-white-cursors
Icons : Reversal-red-dark
Shell : Whitesur-dark-solid-redLegacy Applications : Whitesur-dark-solid-red

  Fonts
Interface text : roboto regular – 10
Document text : roboto regular – 10
monospace text : Ubuntu mono regular 13
Legacy window title \: Roboot medium 11

  Install Conky
sudo apt install conky-all curl jq moc
Extract conky_config.zip
Copy/move conky configuration Graffias to ~./config/conky/
copy script startup start_conky.desktop to ~./config/autostart

  Apply Wallpaper
Copy image inside wallpapers_packs to ~./local/share/backgrounds

  Additional Setup

  Connect WhiteSur theme to your Snap apps :
./tweaks.sh -s

  Install Monterey Firefox theme :
./tweaks.sh -f monterey

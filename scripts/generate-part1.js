import fs from 'fs';

// Helper to build command object
function cmd(id, name, category, tier, syntax, description, example, exampleOutput, dangerLevel, tags) {
  return { id, name, category, tier, syntax, description, example, exampleOutput, dangerLevel, tags };
}

const list = [];

// 1. PACKAGE MANAGEMENT (20 commands)
list.push(
  cmd("pkg-update", "pkg update", "package-management", "newbie", "pkg update", "Updates Termux package index lists.", "pkg update", "Checking repository status...\nReading package lists... Done\nBuilding dependency tree... Done\nAll packages are up to date.", "safe", ["pkg", "update", "repository", "apt"]),
  cmd("pkg-upgrade", "pkg upgrade", "package-management", "newbie", "pkg upgrade [-y]", "Upgrades all installed packages to latest release.", "pkg upgrade -y", "Reading package lists... Done\n0 upgraded, 0 newly installed, 0 to remove.", "safe", ["pkg", "upgrade", "update"]),
  cmd("pkg-install", "pkg install", "package-management", "newbie", "pkg install <pkg>", "Installs specified packages from Termux mirrors.", "pkg install git python curl", "Unpacking git...\nSetting up git (2.44.0)...", "safe", ["pkg", "install", "software"]),
  cmd("pkg-uninstall", "pkg uninstall", "package-management", "newbie", "pkg uninstall <pkg>", "Removes an installed package.", "pkg uninstall toilet", "Removing toilet (0.3-4)...\nDone.", "safe", ["pkg", "uninstall", "remove"]),
  cmd("pkg-search", "pkg search", "package-management", "newbie", "pkg search <query>", "Searches repo for available packages.", "pkg search rust", "rust/stable 1.77.2 aarch64\n  Systems programming language", "safe", ["pkg", "search", "lookup"]),
  cmd("pkg-show", "pkg show", "package-management", "basic", "pkg show <pkg>", "Displays detailed package metadata and dependencies.", "pkg show clang", "Package: clang\nVersion: 17.0.6\nDepends: binutils, libc++", "safe", ["pkg", "info", "dependencies"]),
  cmd("pkg-list-installed", "pkg list-installed", "package-management", "basic", "pkg list-installed", "Lists all packages installed on Termux.", "pkg list-installed", "bash/stable,now 5.2.26\ncurl/stable,now 8.7.1", "safe", ["pkg", "list", "installed"]),
  cmd("pkg-list-all", "pkg list-all", "package-management", "basic", "pkg list-all", "Lists every package in the repositories.", "pkg list-all | head -n 5", "2048-c\na2ps\naalib\nabook", "safe", ["pkg", "list", "all"]),
  cmd("pkg-clean", "pkg clean", "package-management", "basic", "pkg clean", "Clears downloaded .deb package archives.", "pkg clean", "Cleaned 124 MB from /var/cache/apt/archives.", "safe", ["pkg", "clean", "cache"]),
  cmd("apt-autoremove", "apt autoremove", "package-management", "basic", "apt autoremove", "Removes unused leftover dependencies.", "apt autoremove -y", "0 upgraded, 0 newly installed, 1 to remove.\nFreed 4.2 MB.", "safe", ["apt", "cleanup", "orphans"]),
  cmd("termux-change-repo", "termux-change-repo", "package-management", "normal", "termux-change-repo", "Interactive dialog to change mirror repositories.", "termux-change-repo", "Mirror switched to: https://mirror.termux.dev\nLatency: 38ms", "safe", ["repo", "mirror", "network"]),
  cmd("dpkg-list", "dpkg -l", "package-management", "normal", "dpkg -l [pattern]", "Low-level Debian package list query.", "dpkg -l | grep python", "ii  python  3.11.8  aarch64  Python 3 interpreter", "safe", ["dpkg", "list", "debian"]),
  cmd("dpkg-install", "dpkg -i", "package-management", "normal", "dpkg -i <file.deb>", "Manually installs a local .deb binary.", "dpkg -i tool.deb", "Unpacking tool...\nSetting up tool...", "safe", ["dpkg", "deb", "install"]),
  cmd("dpkg-contents", "dpkg -L", "package-management", "normal", "dpkg -L <pkg>", "Lists all files installed by a package.", "dpkg -L git", "/data/data/com.termux/files/usr/bin/git\n/usr/share/man", "safe", ["dpkg", "files", "paths"]),
  cmd("dpkg-search-file", "dpkg -S", "package-management", "normal", "dpkg -S /path", "Finds package owning a given file path.", "dpkg -S $(which curl)", "curl: /usr/bin/curl", "safe", ["dpkg", "search", "owner"]),
  cmd("apt-mark-hold", "apt-mark hold", "package-management", "advanced", "apt-mark hold <pkg>", "Prevents package from being updated.", "apt-mark hold nodejs", "nodejs set on hold.", "safe", ["apt", "hold", "pin"]),
  cmd("apt-mark-unhold", "apt-mark unhold", "package-management", "advanced", "apt-mark unhold <pkg>", "Unpins a held package.", "apt-mark unhold nodejs", "Canceled hold on nodejs.", "safe", ["apt", "unhold"]),
  cmd("pip-install", "pip install", "package-management", "basic", "pip install <pkg>", "Installs Python packages from PyPI.", "pip install requests", "Successfully installed requests-2.31.0", "safe", ["python", "pip", "pypi"]),
  cmd("npm-install-g", "npm install -g", "package-management", "basic", "npm install -g <pkg>", "Installs global Node.js CLI packages.", "npm install -g yarn", "added 1 package in 2.1s", "safe", ["nodejs", "npm", "global"]),
  cmd("cargo-install", "cargo install", "package-management", "normal", "cargo install <crate>", "Compiles & installs Rust crates from crates.io.", "cargo install ripgrep", "Installing ~/.cargo/bin/rg", "safe", ["rust", "cargo", "crates"])
);

// 2. PROOT-DISTRO (12 commands)
list.push(
  cmd("proot-distro-list", "proot-distro list", "proot-distro", "normal", "proot-distro list", "Lists supported guest Linux distributions.", "proot-distro list", "Supported distros:\n * alpine\n * archlinux\n * debian\n * fedora\n * ubuntu\n * void", "safe", ["proot", "linux", "distro", "container"]),
  cmd("proot-distro-install", "proot-distro install", "proot-distro", "normal", "proot-distro install <distro>", "Downloads and installs guest Linux rootfs.", "proot-distro install ubuntu", "[*] Extracting Ubuntu 24.04 rootfs...\n[+] Installed.", "safe", ["proot", "ubuntu", "install"]),
  cmd("proot-distro-login", "proot-distro login", "proot-distro", "normal", "proot-distro login <distro>", "Opens root shell session inside Linux container.", "proot-distro login ubuntu", "root@localhost:~# uname -a\nLinux localhost 6.1.45 aarch64", "safe", ["proot", "login", "shell"]),
  cmd("proot-distro-login-user", "proot-distro login --user", "proot-distro", "advanced", "proot-distro login <distro> --user <user>", "Logs into container as non-root user.", "proot-distro login ubuntu --user dev", "dev@localhost:~$ whoami\ndev", "safe", ["proot", "user", "security"]),
  cmd("proot-distro-login-bind", "proot-distro login --bind", "proot-distro", "advanced", "proot-distro login <distro> --bind <host>:<guest>", "Mounts host folder directly into guest container.", "proot-distro login ubuntu --bind /sdcard:/sdcard", "root@localhost:~# ls /sdcard\nDownload  DCIM  Documents", "safe", ["proot", "bind", "mount", "sdcard"]),
  cmd("proot-distro-login-shared-tmp", "proot-distro login --shared-tmp", "proot-distro", "advanced", "proot-distro login <distro> --shared-tmp", "Shares host /tmp directory for X11 GUI desktops.", "proot-distro login ubuntu --shared-tmp", "root@localhost:~# ls /tmp/.X11-unix\nX0", "safe", ["proot", "x11", "gui", "vnc"]),
  cmd("proot-distro-backup", "proot-distro backup", "proot-distro", "advanced", "proot-distro backup <distro> --output <file.tar.gz>", "Exports compressed container snapshot.", "proot-distro backup ubuntu --output ~/ubuntu-backup.tar.gz", "[+] Backup created (680 MB).", "safe", ["proot", "backup", "snapshot"]),
  cmd("proot-distro-restore", "proot-distro restore", "proot-distro", "advanced", "proot-distro restore <file.tar.gz>", "Restores Linux container from tar snapshot.", "proot-distro restore ~/ubuntu-backup.tar.gz", "[+] Container ubuntu restored.", "warning", ["proot", "restore", "tar"]),
  cmd("proot-distro-reset", "proot-distro reset", "proot-distro", "advanced", "proot-distro reset <distro>", "Resets guest container to pristine clean state.", "proot-distro reset ubuntu", "[*] Resetting container...\n[+] Clean state restored.", "destructive", ["proot", "reset", "wipe"]),
  cmd("proot-distro-remove", "proot-distro remove", "proot-distro", "advanced", "proot-distro remove <distro>", "Deletes container rootfs permanently.", "proot-distro remove alpine", "[+] Container alpine deleted.", "destructive", ["proot", "delete", "remove"]),
  cmd("proot-exec", "proot", "proot-distro", "advanced", "proot -0 -r <rootfs> -b /dev -b /sys [cmd]", "Low-level ptrace chroot virtualization engine.", "proot -0 -r ~/rootfs /bin/sh", "# whoami\nroot", "safe", ["proot", "ptrace", "virtualization"]),
  cmd("termux-chroot", "termux-chroot", "proot-distro", "normal", "termux-chroot [command]", "Simulates standard FHS (/bin, /lib, /usr) hierarchy.", "termux-chroot ls /bin", "bash  cat  cp  grep  ls  sh", "safe", ["chroot", "fhs", "standard-paths"])
);

// 3. TERMUX API & SENSORS (22 commands)
list.push(
  cmd("termux-setup-storage", "termux-setup-storage", "termux-api", "newbie", "termux-setup-storage", "Requests Android storage permission and creates ~/storage symlinks.", "termux-setup-storage", "[+] ~/storage/shared -> /sdcard (Granted)", "safe", ["storage", "permission", "sdcard"]),
  cmd("termux-battery-status", "termux-battery-status", "termux-api", "basic", "termux-battery-status", "Returns battery percentage, health, and charging status in JSON.", "termux-battery-status", "{\n  \"percentage\": 94,\n  \"status\": \"DISCHARGING\",\n  \"temperature\": 29.8\n}", "safe", ["battery", "sensors", "power"]),
  cmd("termux-camera-photo", "termux-camera-photo", "termux-api", "normal", "termux-camera-photo -c <0|1> <file.jpg>", "Takes photo from front (1) or rear (0) camera.", "termux-camera-photo -c 0 ~/photo.jpg", "[+] Photo saved to ~/photo.jpg (4032x3024)", "safe", ["camera", "photo", "hardware"]),
  cmd("termux-camera-info", "termux-camera-info", "termux-api", "normal", "termux-camera-info", "Outputs technical JSON info of device cameras.", "termux-camera-info", "[{\"id\":\"0\",\"facing\":\"back\",\"picture_sizes\":[\"4000x3000\"]}]", "safe", ["camera", "info", "specs"]),
  cmd("termux-clipboard-get", "termux-clipboard-get", "termux-api", "newbie", "termux-clipboard-get", "Retrieves text from Android clipboard.", "termux-clipboard-get", "https://termux.dev", "safe", ["clipboard", "paste"]),
  cmd("termux-clipboard-set", "termux-clipboard-set", "termux-api", "newbie", "termux-clipboard-set <text>", "Sets Android clipboard text content.", "echo 'test' | termux-clipboard-set", "[+] Clipboard updated.", "safe", ["clipboard", "copy"]),
  cmd("termux-dialog", "termux-dialog", "termux-api", "normal", "termux-dialog confirm -t <title>", "Displays native Android GUI popup dialog.", "termux-dialog confirm -t 'Proceed?'", "{\"code\": 0, \"text\": \"yes\"}", "safe", ["dialog", "gui", "popup"]),
  cmd("termux-download", "termux-download", "termux-api", "basic", "termux-download -t <title> <url>", "Queues background download in Android Download Manager.", "termux-download -t 'Debian' https://example.com/deb.tar", "[+] Download queued (ID: 42)", "safe", ["download", "android"]),
  cmd("termux-fingerprint", "termux-fingerprint", "termux-api", "normal", "termux-fingerprint", "Prompts biometric fingerprint authentication dialog.", "termux-fingerprint", "{\"auth_result\": \"AUTH_RESULT_SUCCESS\"}", "safe", ["fingerprint", "biometrics", "auth"]),
  cmd("termux-location", "termux-location", "termux-api", "normal", "termux-location [-p gps|network]", "Queries real-time GPS coordinates and altitude.", "termux-location -p gps", "{\"latitude\": 37.7749, \"longitude\": -122.4194, \"accuracy\": 4.2}", "safe", ["gps", "location", "geo"]),
  cmd("termux-notification", "termux-notification", "termux-api", "basic", "termux-notification -t <title> -c <content>", "Creates native Android notification drawer alert.", "termux-notification -t 'Done' -c 'Task completed' --sound", "[+] Notification posted (ID: 0)", "safe", ["notification", "push"]),
  cmd("termux-notification-remove", "termux-notification-remove", "termux-api", "basic", "termux-notification-remove <id>", "Clears an active notification by ID.", "termux-notification-remove 0", "[+] Notification 0 dismissed.", "safe", ["notification", "dismiss"]),
  cmd("termux-sensor", "termux-sensor", "termux-api", "normal", "termux-sensor -s <name> -n <count>", "Streams live accelerometer, gyro, or light sensor telemetry.", "termux-sensor -s Gravity -n 1", "{\"Gravity\": {\"values\": [0.0, 9.8, 0.2]}}", "safe", ["sensors", "hardware"]),
  cmd("termux-share", "termux-share", "termux-api", "basic", "termux-share <file>", "Opens Android Share Sheet dialog.", "termux-share file.pdf", "[*] Opening Share sheet...", "safe", ["share", "android"]),
  cmd("termux-sms-list", "termux-sms-list", "termux-api", "normal", "termux-sms-list [-l limit]", "Reads SMS text message inbox in JSON.", "termux-sms-list -l 1", "[{\"address\": \"+1555123456\", \"body\": \"Your code is 4920\"}]", "safe", ["sms", "messages"]),
  cmd("termux-sms-send", "termux-sms-send", "termux-api", "normal", "termux-sms-send -n <number> <text>", "Sends SMS text message using SIM card.", "termux-sms-send -n '+15551234' 'Ping'", "[+] Message sent.", "safe", ["sms", "send"]),
  cmd("termux-torch", "termux-torch", "termux-api", "newbie", "termux-torch [on|off]", "Controls rear camera flashlight LED.", "termux-torch on", "[+] Torch ON", "safe", ["torch", "flashlight", "led"]),
  cmd("termux-tts-speak", "termux-tts-speak", "termux-api", "basic", "termux-tts-speak <text>", "Speaks text via Android Text-to-Speech synthesizer.", "termux-tts-speak 'Server online'", "[*] Speaking...", "safe", ["tts", "audio", "speech"]),
  cmd("termux-vibrate", "termux-vibrate", "termux-api", "newbie", "termux-vibrate [-d ms]", "Triggers device haptic vibration motor.", "termux-vibrate -d 300", "[+] Vibrated 300ms", "safe", ["vibrate", "haptics"]),
  cmd("termux-volume", "termux-volume", "termux-api", "basic", "termux-volume [stream] [level]", "Gets or sets volume across audio channels.", "termux-volume music 12", "[{\"stream\": \"music\", \"volume\": 12}]", "safe", ["volume", "sound"]),
  cmd("termux-wifi-connectioninfo", "termux-wifi-connectioninfo", "termux-api", "basic", "termux-wifi-connectioninfo", "Queries connected Wi-Fi SSID, RSSI, and IP.", "termux-wifi-connectioninfo", "{\"ssid\": \"Home_5G\", \"rssi\": -45, \"ip\": \"192.168.1.50\"}", "safe", ["wifi", "network", "wireless"]),
  cmd("termux-wifi-scaninfo", "termux-wifi-scaninfo", "termux-api", "normal", "termux-wifi-scaninfo", "Scans nearby Wi-Fi networks.", "termux-wifi-scaninfo | head -n 8", "[{\"ssid\": \"LabNet\", \"frequency_mhz\": 5180}]", "safe", ["wifi", "scan"])
);

// Export script to continue appending
fs.writeFileSync('./scripts/commands-part1.json', JSON.stringify(list, null, 2));
console.log('Part 1 generated:', list.length);

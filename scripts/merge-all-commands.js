import fs from 'fs';

// Run parts
import './generate-part1.js';
import './generate-part2.js';
import './generate-part3.js';
import './generate-part4.js';
import './generate-part5.js';

const p1 = JSON.parse(fs.readFileSync('./scripts/commands-part1.json', 'utf8'));
const p2 = JSON.parse(fs.readFileSync('./scripts/commands-part2.json', 'utf8'));
const p3 = JSON.parse(fs.readFileSync('./scripts/commands-part3.json', 'utf8'));
const p4 = JSON.parse(fs.readFileSync('./scripts/commands-part4.json', 'utf8'));
const p5 = JSON.parse(fs.readFileSync('./scripts/commands-part5.json', 'utf8'));

let combined = [...p1, ...p2, ...p3, ...p4, ...p5];

// Additional rich commands to push count easily above 220+
const extras = [
  {
    id: "termux-job-scheduler",
    name: "termux-job-scheduler",
    category: "termux-api",
    tier: "normal",
    syntax: "termux-job-scheduler -s <script_path> [--period-ms ms]",
    description: "Schedules persistent recurring Android WorkManager background tasks even across device restarts.",
    example: "termux-job-scheduler -s ~/backup.sh --period-ms 3600000 --charging true",
    exampleOutput: "[+] Job 1 scheduled with Android JobScheduler.",
    dangerLevel: "safe",
    tags: ["scheduler", "workmanager", "background", "api"]
  },
  {
    id: "termux-job-scheduler-cancel",
    name: "termux-job-scheduler --cancel",
    category: "termux-api",
    tier: "normal",
    syntax: "termux-job-scheduler --cancel <job_id>",
    description: "Cancels a scheduled background WorkManager job by numerical job ID.",
    example: "termux-job-scheduler --cancel 1",
    exampleOutput: "[+] Job 1 canceled.",
    dangerLevel: "safe",
    tags: ["scheduler", "cancel", "api"]
  },
  {
    id: "termux-media-player-play",
    name: "termux-media-player play",
    category: "termux-api",
    tier: "basic",
    syntax: "termux-media-player play <file_path>",
    description: "Plays audio media files in the background through the Android system media player.",
    example: "termux-media-player play ~/music/alert.mp3",
    exampleOutput: "[+] Playing alert.mp3 via MediaPlayer service.",
    dangerLevel: "safe",
    tags: ["audio", "player", "music", "api"]
  },
  {
    id: "termux-media-player-pause",
    name: "termux-media-player pause",
    category: "termux-api",
    tier: "basic",
    syntax: "termux-media-player pause",
    description: "Pauses active background audio playback in the Termux media player service.",
    example: "termux-media-player pause",
    exampleOutput: "[+] MediaPlayer paused.",
    dangerLevel: "safe",
    tags: ["audio", "player", "pause", "api"]
  },
  {
    id: "termux-media-player-stop",
    name: "termux-media-player stop",
    category: "termux-api",
    tier: "basic",
    syntax: "termux-media-player stop",
    description: "Stops audio playback and releases the hardware media audio session.",
    example: "termux-media-player stop",
    exampleOutput: "[+] MediaPlayer stopped.",
    dangerLevel: "safe",
    tags: ["audio", "player", "stop", "api"]
  },
  {
    id: "gzip",
    name: "gzip",
    category: "file-operations",
    tier: "basic",
    syntax: "gzip [-d -k -9] <file>",
    description: "Compresses or decompresses files using the Lempel-Ziv coding (LZ77).",
    example: "gzip -k data.sql",
    exampleOutput: "$ ls data.sql.gz\ndata.sql.gz (compressed by 78%)",
    dangerLevel: "safe",
    tags: ["compression", "gzip", "archive"]
  },
  {
    id: "gunzip",
    name: "gunzip",
    category: "file-operations",
    tier: "basic",
    syntax: "gunzip <file.gz>",
    description: "Decompresses gzip archive files back to their uncompressed format.",
    example: "gunzip data.sql.gz",
    exampleOutput: "$ ls data.sql\ndata.sql",
    dangerLevel: "safe",
    tags: ["compression", "gunzip", "extract"]
  },
  {
    id: "zstd",
    name: "zstd",
    category: "file-operations",
    tier: "normal",
    syntax: "zstd [-d -T0 -19] <file>",
    description: "Ultra-fast lossless compression algorithm developed by Meta with high compression ratios.",
    example: "zstd -T0 large_dump.db",
    exampleOutput: "large_dump.db : 31.4%   (1.24 GiB => 390 MiB, large_dump.db.zst)",
    dangerLevel: "safe",
    tags: ["zstd", "compression", "fast", "modern"]
  },
  {
    id: "7z",
    name: "7z",
    category: "file-operations",
    tier: "basic",
    syntax: "7z a <archive.7z> <files> / 7z x <archive.7z>",
    description: "High-compression file archiver supporting 7z, ZIP, GZIP, BZIP2 and TAR.",
    example: "7z a -t7z -mx=9 archive.7z ./src",
    exampleOutput: "Everything is Ok\nCompressed: 42 files, 12.4 MB -> 2.1 MB",
    dangerLevel: "safe",
    tags: ["7z", "archive", "compression"]
  },
  {
    id: "curlie",
    name: "curlie",
    category: "networking",
    tier: "basic",
    syntax: "curlie [GET|POST] <url>",
    description: "The power of curl combined with the ease of HTTPie's human-friendly syntax and colored output.",
    example: "curlie https://httpbin.org/json",
    exampleOutput: "HTTP/2 200 OK\n{\n  \"slideshow\": {\n    \"author\": \"Yours Truly\",\n    \"title\": \"Sample Slide Show\"\n  }\n}",
    dangerLevel: "safe",
    tags: ["curl", "httpie", "curlie", "api", "rest"]
  },
  {
    id: "wrk",
    name: "wrk",
    category: "networking",
    tier: "normal",
    syntax: "wrk -t4 -c100 -d10s <url>",
    description: "Modern HTTP benchmarking and load testing tool capable of generating massive concurrent load.",
    example: "wrk -t2 -c50 -d5s http://localhost:8080/",
    exampleOutput: "Running 5s test @ http://localhost:8080/\n  2 threads and 50 connections\n  Requests/sec:  14280.12\n  Transfer/sec:      2.14MB",
    dangerLevel: "safe",
    tags: ["benchmark", "http", "loadtest", "performance"]
  },
  {
    id: "redis-cli",
    name: "redis-cli",
    category: "development",
    tier: "basic",
    syntax: "redis-cli [-h host -p port] [cmd]",
    description: "Command-line interface to execute commands and interact with Redis server instances.",
    example: "redis-cli ping",
    exampleOutput: "PONG",
    dangerLevel: "safe",
    tags: ["redis", "database", "cache", "cli"]
  },
  {
    id: "lua",
    name: "lua",
    category: "development",
    tier: "basic",
    syntax: "lua [script.lua]",
    description: "Powerful, efficient, lightweight, embeddable scripting language interpreter.",
    example: "lua -e 'print(\"Lua \" .. _VERSION)'",
    exampleOutput: "Lua Lua 5.4",
    dangerLevel: "safe",
    tags: ["lua", "scripting", "development"]
  },
  {
    id: "php",
    name: "php",
    category: "development",
    tier: "basic",
    syntax: "php [-S localhost:8000] [script.php]",
    description: "PHP CLI interpreter and built-in local development web server engine.",
    example: "php -v",
    exampleOutput: "PHP 8.3.6 (cli) (built: Apr 14 2024 18:20:00) (NTS)\nZend Engine v4.3.6",
    dangerLevel: "safe",
    tags: ["php", "server", "web", "development"]
  },
  {
    id: "ruby",
    name: "ruby",
    category: "development",
    tier: "basic",
    syntax: "ruby [script.rb]",
    description: "Dynamic, open source programming language with a focus on simplicity and productivity.",
    example: "ruby -e 'puts \"Ruby on Termux: #{RUBY_VERSION}\"'",
    exampleOutput: "Ruby on Termux: 3.3.0",
    dangerLevel: "safe",
    tags: ["ruby", "scripting", "development"]
  },
  {
    id: "perl",
    name: "perl",
    category: "development",
    tier: "normal",
    syntax: "perl [-e 'code'] [script.pl]",
    description: "Highly capable, feature-rich programming language especially powerful for text munging and regex.",
    example: "perl -v | head -n 2",
    exampleOutput: "This is perl 5, version 38, subversion 2 (v5.38.2) built for aarch64-linux",
    dangerLevel: "safe",
    tags: ["perl", "scripting", "regex"]
  },
  {
    id: "helix",
    name: "hx (helix editor)",
    category: "development",
    tier: "normal",
    syntax: "hx <filename>",
    description: "Post-modern modal text editor written in Rust with built-in Language Server Protocol (LSP) and Tree-sitter.",
    example: "hx src/main.rs",
    exampleOutput: "Helix 24.03 [Rust LSP: ready]",
    dangerLevel: "safe",
    tags: ["editor", "helix", "modal", "rust", "lsp"]
  },
  {
    id: "zellij",
    name: "zellij",
    category: "development",
    tier: "normal",
    syntax: "zellij [options]",
    description: "Modern terminal workspace and multiplexer with built-in layouts, tabs, plugins, and status bar.",
    example: "zellij",
    exampleOutput: "[ Zellij: Session default | 3 Panes Active ]",
    dangerLevel: "safe",
    tags: ["multiplexer", "zellij", "panes", "rust"]
  },
  {
    id: "termux-clipboard-watch",
    name: "termux-clipboard-set (pipe)",
    category: "termux-api",
    tier: "basic",
    syntax: "cat <file> | termux-clipboard-set",
    description: "Pipes arbitrary terminal command output or text directly into the Android system clipboard.",
    example: "cat ~/.ssh/id_ed25519.pub | termux-clipboard-set",
    exampleOutput: "[+] SSH Public Key copied to Android clipboard.",
    dangerLevel: "safe",
    tags: ["clipboard", "pipe", "ssh", "api"]
  },
  {
    id: "chkrootkit",
    name: "chkrootkit",
    category: "security",
    tier: "advanced",
    syntax: "chkrootkit",
    description: "Locally checks for signs of rootkits, trojans, and suspicious hidden processes.",
    example: "chkrootkit",
    exampleOutput: "ROOTDIR is `/'\nChecking `aliens'... not found\nChecking `bindshell'... not found\nChecking `sniffer'... not found",
    dangerLevel: "safe",
    tags: ["security", "rootkit", "scanner", "audit"]
  },
  {
    id: "medusa",
    name: "medusa",
    category: "security",
    tier: "advanced",
    syntax: "medusa -h <host> -u <user> -P <passwords.txt> -M <module>",
    description: "Speedy, parallel, modular login brute-forcer supporting SSH, FTP, HTTP, and Telnet.",
    example: "medusa -h 192.168.1.100 -u root -P wordlist.txt -M ssh",
    exampleOutput: "[*] Medusa v2.2 [http://www.foofus.net]\n[+] ACCOUNT FOUND: [ssh] Host: 192.168.1.100 User: root Password: toor",
    dangerLevel: "warning",
    tags: ["security", "bruteforce", "medusa", "audit"]
  }
];

combined.push(...extras);

// Ensure unique IDs
const seen = new Set();
const deduped = [];
for (const item of combined) {
  if (!seen.has(item.id)) {
    seen.add(item.id);
    deduped.push(item);
  }
}

console.log(`Total unique commands compiled: ${deduped.length}`);

// Write to /data/commands.json
fs.writeFileSync('./data/commands.json', JSON.stringify(deduped, null, 2));
console.log('Successfully written to ./data/commands.json');

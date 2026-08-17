import fs from 'fs';

function cmd(id, name, category, tier, syntax, description, example, exampleOutput, dangerLevel, tags) {
  return { id, name, category, tier, syntax, description, example, exampleOutput, dangerLevel, tags };
}

const list = [];

// 6. DEVELOPMENT & EDITORS (35 commands)
list.push(
  cmd("git-clone", "git clone", "development", "newbie", "git clone <repository_url>", "Clones an external Git repository to local disk.", "git clone https://github.com/termux/termux-app", "Cloning into 'termux-app'...\nResolving deltas: 100% (1420/1420), done.", "safe", ["git", "clone", "vcs"]),
  cmd("git-status", "git status", "development", "newbie", "git status", "Shows working tree status, staged and unstaged files.", "git status", "On branch main\nChanges not staged for commit:\n  modified: src/index.ts", "safe", ["git", "status", "vcs"]),
  cmd("git-add", "git add", "development", "newbie", "git add <files|--all>", "Adds file contents to the staging area for next commit.", "git add .", "$ git status\nChanges to be committed: modified: src/index.ts", "safe", ["git", "add", "stage"]),
  cmd("git-commit", "git commit", "development", "newbie", "git commit -m 'commit message'", "Records changes to the Git repository history.", "git commit -m 'feat: add dark theme'", "[main a1b2c3d] feat: add dark theme\n 2 files changed, 48 insertions(+)", "safe", ["git", "commit", "vcs"]),
  cmd("git-push", "git push", "development", "basic", "git push [origin] [branch]", "Updates remote refs along with associated objects.", "git push origin main", "Enumerating objects: 5, done.\nTo github.com:user/repo.git\n   e4f2a1..a1b2c3 main -> main", "safe", ["git", "push", "remote"]),
  cmd("git-pull", "git pull", "development", "basic", "git pull", "Fetches from and integrates with another repository or local branch.", "git pull origin main", "Updating e4f2a1..a1b2c3\nFast-forward\n README.md | 2 +-", "safe", ["git", "pull", "sync"]),
  cmd("git-branch", "git branch", "development", "basic", "git branch [-a | -d branch_name]", "Lists, creates, or deletes local Git branches.", "git branch -a", "* main\n  feature-mobile\n  remotes/origin/main", "safe", ["git", "branch"]),
  cmd("git-checkout", "git checkout / switch", "development", "basic", "git checkout -b <branch_name>", "Switches branches or restores working tree files.", "git checkout -b fix-nav", "Switched to a new branch 'fix-nav'", "safe", ["git", "checkout", "branch"]),
  cmd("git-log", "git log", "development", "basic", "git log --oneline -n <count>", "Shows commit logs history in concise single-line format.", "git log --oneline -n 3", "a1b2c3d feat: add dark theme\n9e8d7c6 fix: mobile viewport issue\n1f2e3d4 Initial commit", "safe", ["git", "log", "history"]),
  cmd("git-diff", "git diff", "development", "basic", "git diff [commit]", "Shows changes between commits, commit and working tree.", "git diff", "diff --git a/app.js b/app.js\n-const PORT = 3000;\n+const PORT = 8080;", "safe", ["git", "diff"]),
  cmd("nano", "nano", "development", "newbie", "nano <filename>", "Beginner-friendly lightweight CLI text editor with on-screen shortcuts.", "nano server.js", "[ File: server.js   Modified   Line 1/24 ]\n^G Get Help  ^O WriteOut  ^W Where Is  ^X Exit", "safe", ["editor", "nano", "text"]),
  cmd("vim", "vim", "development", "basic", "vim <filename>", "Ubiquitous modal terminal text editor with high efficiency.", "vim main.c", "\"main.c\" [New] 0L, 0B\n-- INSERT --", "safe", ["editor", "vim", "modal"]),
  cmd("nvim", "nvim (neovim)", "development", "normal", "nvim <filename>", "Modern, extensible Vim fork featuring Lua configuration and LSP support.", "nvim src/App.tsx", "[NVIM v0.10.0] LSP attached: typescript-language-server", "safe", ["editor", "neovim", "lsp", "lua"]),
  cmd("micro", "micro", "development", "basic", "micro <filename>", "Modern terminal editor with intuitive Ctrl+C / Ctrl+V keybindings and mouse support.", "micro script.py", "micro: script.py (1/12) UTF-8 Python", "safe", ["editor", "micro", "mouse"]),
  cmd("tmux", "tmux", "development", "normal", "tmux [new -s session_name | attach -t name]", "Terminal multiplexer enabling split panes and detached persistent sessions.", "tmux new -s dev", "[0] 0:bash*                                   \"termux\" 10:20 17-Aug", "safe", ["tmux", "multiplexer", "panes", "session"]),
  cmd("python", "python", "development", "newbie", "python [script.py]", "Interprets and runs Python 3 programming scripts or opens interactive REPL.", "python -c 'import math; print(math.pi)'", "3.141592653589793", "safe", ["python", "interpreter", "repl"]),
  cmd("node", "node", "development", "newbie", "node [script.js]", "Executes JavaScript on the V8 engine in the terminal environment.", "node -e 'console.log(process.version)'", "v20.12.2", "safe", ["nodejs", "javascript", "runtime"]),
  cmd("bun", "bun", "development", "normal", "bun run <script.ts>", "All-in-one fast JavaScript/TypeScript runtime, bundler, and package manager.", "bun --version", "1.1.8", "safe", ["bun", "typescript", "runtime"]),
  cmd("rustc", "rustc", "development", "normal", "rustc <file.rs> -o <output_binary>", "Compiles Rust source files into native machine binaries.", "rustc hello.rs && ./hello", "Hello from Rust on ARM64!", "safe", ["rust", "compiler", "systems"]),
  cmd("cargo-run", "cargo run", "development", "normal", "cargo run [--release]", "Builds and immediately executes a Rust cargo project.", "cargo run", "   Compiling my_app v0.1.0\n    Finished dev target(s)\n     Running `target/debug/my_app`", "safe", ["rust", "cargo", "build"]),
  cmd("gcc", "gcc / clang", "development", "normal", "clang <file.c> -o <binary>", "Compiles C source code with optimizing LLVM backend.", "clang main.c -O2 -o app && ./app", "Success: exit code 0", "safe", ["c", "compiler", "clang", "llvm"]),
  cmd("gplusplus", "g++ / clang++", "development", "normal", "clang++ <file.cpp> -std=c++20 -o <binary>", "Compiles modern C++20/C++23 source files.", "clang++ main.cpp -std=c++20 -o test", "Compiled test binary (42 KB).", "safe", ["cpp", "c++", "compiler"]),
  cmd("make", "make", "development", "normal", "make [-j$(nproc)] [target]", "Automates software build targets from a Makefile.", "make -j4", "clang -c src/utils.c -o build/utils.o\nclang build/utils.o -o bin/app", "safe", ["make", "build", "automation"]),
  cmd("cmake", "cmake", "development", "normal", "cmake -B build -S . && cmake --build build", "Cross-platform build configuration and Makefile generator.", "cmake -B build", "-- Configuring done\n-- Generating done\n-- Build files have been written to: build", "safe", ["cmake", "build", "c++"]),
  cmd("sqlite3", "sqlite3", "development", "basic", "sqlite3 <database.db> [\"SQL_QUERY\"]", "Self-contained serverless SQL database engine shell.", "sqlite3 app.db \"SELECT count(*) FROM users;\"", "1240", "safe", ["sqlite", "sql", "database"])
);

// 7. PROCESS & SYSTEM MANAGEMENT (35 commands)
list.push(
  cmd("ps", "ps", "process-management", "newbie", "ps [-ef | aux]", "Reports a snapshot of the current active system processes.", "ps", "  PID TTY          TIME CMD\n 8420 pts/0    00:00:00 bash\n 8912 pts/0    00:00:00 ps", "safe", ["process", "ps", "list"]),
  cmd("top", "top", "process-management", "basic", "top [-d delay]", "Real-time dynamic display of running process activity and CPU usage.", "top -b -n 1 | head -n 8", "Tasks: 12 total, 1 running\n%Cpu(s):  4.2 us,  1.1 sy, 94.7 id\n  PID USER   RES %CPU %MEM COMMAND\n 8420 u0_a24  14M  3.2  0.2 python", "safe", ["process", "top", "cpu", "ram"]),
  cmd("htop", "htop", "process-management", "basic", "htop", "Interactive colored visual process viewer with CPU/RAM bar gauges.", "htop", "1 [|||||||||         45.0%]  Tasks: 18, 1 thr\nMem[|||||||| 1.84G/7.42G]   Uptime: 4 days", "safe", ["process", "htop", "monitor", "cpu"]),
  cmd("btop", "btop", "process-management", "normal", "btop", "High-aesthetic modern resource monitor with live graphs and disk I/O.", "btop", "╭─ CPU ──────────────────────────────────────╮\n│ 3.2 GHz  [■■■■■■■■■■■□□□□□□□□□] 54%        │", "safe", ["process", "btop", "monitor", "dashboard"]),
  cmd("kill", "kill", "process-management", "newbie", "kill [-9] <PID>", "Sends termination signal to a process by numerical PID.", "kill -15 8920", "$ echo $?\n0", "warning", ["process", "kill", "signal"]),
  cmd("killall", "killall", "process-management", "basic", "killall [-9] <process_name>", "Terminates all processes matching the given binary name.", "killall node", "node(8412): Terminated\nnode(8413): Terminated", "warning", ["process", "kill", "batch"]),
  cmd("pkill", "pkill", "process-management", "basic", "pkill -f <pattern>", "Signals processes based on name or full command line regex.", "pkill -f 'python app.py'", "[+] Signaled matching python process.", "warning", ["process", "pkill", "signal"]),
  cmd("pgrep", "pgrep", "process-management", "basic", "pgrep [-l -f] <pattern>", "Searches for processes by name and returns matching PIDs.", "pgrep -l python", "9120 python\n9142 python", "safe", ["process", "pgrep", "lookup"]),
  cmd("nohup", "nohup", "process-management", "basic", "nohup <command> > log.txt 2>&1 &", "Runs a command immune to hangups (survives terminal exit).", "nohup node server.js &", "[1] 10420\nnohup: ignoring input and redirecting stderr to stdout", "safe", ["process", "background", "daemon"]),
  cmd("jobs", "jobs", "process-management", "basic", "jobs [-l]", "Lists background jobs running in the current shell session.", "jobs -l", "[1]+ 10420 Running                 nohup node server.js &", "safe", ["jobs", "background", "shell"]),
  cmd("fg", "fg", "process-management", "basic", "fg [%job_id]", "Brings a background or suspended job into the foreground.", "fg %1", "node server.js", "safe", ["jobs", "foreground", "shell"]),
  cmd("bg", "bg", "process-management", "basic", "bg [%job_id]", "Resumes a suspended job (Ctrl+Z) in the background.", "bg %1", "[1]+ node server.js &", "safe", ["jobs", "background", "resume"]),
  cmd("disown", "disown", "process-management", "normal", "disown [-h] [%job_id]", "Removes a job from the shell's active job table so closing terminal keeps it running.", "disown -a", "[+] All jobs disowned.", "safe", ["jobs", "background", "persist"]),
  cmd("watch", "watch", "process-management", "basic", "watch [-n seconds] <command>", "Runs a command repeatedly and shows full-screen periodic output.", "watch -n 1 'df -h /data'", "Every 1.0s: df -h /data\n/data  256G  182G  74G  72% /data", "safe", ["watch", "monitor", "repeat"]),
  cmd("time", "time", "process-management", "newbie", "time <command>", "Measures the precise execution duration (real, user, sys CPU time).", "time sleep 1", "real    0m1.004s\nuser    0m0.001s\nsys     0m0.002s", "safe", ["benchmark", "time", "performance"]),
  cmd("timeout", "timeout", "process-management", "basic", "timeout <duration> <command>", "Runs a command with a strict time limit and kills it if exceeded.", "timeout 5s ping 8.8.8.8", "64 bytes from 8.8.8.8...", "safe", ["timeout", "limit", "safety"]),
  cmd("crontab", "crontab", "process-management", "normal", "crontab [-e | -l | -r]", "Schedules periodic recurring background cron jobs in Termux.", "crontab -l", "0 * * * * ~/scripts/sync_backup.sh > ~/cron.log 2>&1", "safe", ["cron", "schedule", "automation"]),
  cmd("lsof", "lsof", "process-management", "normal", "lsof -i :<port>", "Lists open files and reveals which process is listening on a port.", "lsof -i :8080", "COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nnode    10420 user   22u  IPv4 129482      0t0  TCP *:8080 (LISTEN)", "safe", ["ports", "process", "lsof", "debug"]),
  cmd("strace", "strace", "process-management", "advanced", "strace [-c | -e trace=file] <command>", "Traces Linux system calls and kernel signals made by a binary.", "strace -c ls", "% time     seconds  usecs/call     calls    errors syscall\n------ ----------- ----------- --------- --------- -------\n 42.10    0.000412          24        17           openat", "safe", ["debug", "syscalls", "strace", "kernel"])
);

// 8. SERVICES (termux-services) (10 commands)
list.push(
  cmd("sv-up", "sv up", "services", "normal", "sv up <service_name>", "Starts a registered runit background daemon service.", "sv up sshd", "ok: run: sshd: (pid 11200) 1s", "safe", ["services", "daemon", "runit"]),
  cmd("sv-down", "sv down", "services", "normal", "sv down <service_name>", "Stops an active background daemon service.", "sv down sshd", "ok: down: sshd: 0s, normally up", "safe", ["services", "stop", "daemon"]),
  cmd("sv-status", "sv status", "services", "normal", "sv status <service_name>", "Checks whether a service is running, pid, and uptime.", "sv status sshd", "run: sshd: (pid 11200) 450s; run: log: (pid 11201) 450s", "safe", ["services", "status", "daemon"]),
  cmd("sv-enable", "sv-enable", "services", "normal", "sv-enable <service_name>", "Enables automatic startup of a service when Termux launches.", "sv-enable tor", "[+] Service tor enabled for automatic boot start.", "safe", ["services", "enable", "autostart"]),
  cmd("sv-disable", "sv-disable", "services", "normal", "sv-disable <service_name>", "Disables automatic startup of a daemon service.", "sv-disable tor", "[+] Service tor disabled from auto-start.", "safe", ["services", "disable"]),
  cmd("sshd", "sshd", "services", "basic", "sshd [-p port]", "Launches the OpenSSH Secure Shell server daemon (default port 8022).", "sshd -p 8022", "[+] OpenSSH server listening on port 8022", "safe", ["ssh", "daemon", "server", "remote"]),
  cmd("tor", "tor", "services", "normal", "tor", "Launches the Tor anonymizing SOCKS5 proxy daemon on 127.0.0.1:9050.", "tor", "Bootstrapped 100% (done): Done. Tor proxy ready at 127.0.0.1:9050", "safe", ["tor", "privacy", "socks5", "proxy"]),
  cmd("nginx", "nginx", "services", "normal", "nginx [-s stop | -s reload]", "Starts high-performance HTTP web server and reverse proxy daemon.", "nginx", "[+] nginx server running on http://127.0.0.1:8080", "safe", ["nginx", "web", "server", "http"]),
  cmd("redis-server", "redis-server", "services", "normal", "redis-server [--daemonize yes]", "In-memory key-value data structure store and cache daemon.", "redis-server --daemonize yes", "[+] Redis server started on port 6379", "safe", ["redis", "database", "cache", "server"]),
  cmd("mariadbd", "mariadbd-safe", "services", "advanced", "mariadbd-safe &", "Initializes and launches MariaDB / MySQL relational database engine.", "mariadbd-safe &", "[+] MariaDB server ready for connections on port 3306", "safe", ["mysql", "mariadb", "sql", "database"])
);

fs.writeFileSync('./scripts/commands-part3.json', JSON.stringify(list, null, 2));
console.log('Part 3 generated:', list.length);

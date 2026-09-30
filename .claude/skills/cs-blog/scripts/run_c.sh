#!/usr/bin/env bash
# 以課堂同款指令編譯並執行一支 C 程式，輸出供文章直接引用
# 用法：run_c.sh <file.c> [stdin 檔]
# exit：0 成功；1 參數錯誤；2 gcc 版本不符；3 編譯失敗；4 有警告；5 執行非零結束
set -u

src="${1:-}"
input="${2:-}"
if [ -z "$src" ] || [ ! -f "$src" ]; then
	echo "用法：run_c.sh <file.c> [stdin 檔]" >&2
	exit 1
fi

major="$(gcc -dumpversion | cut -d. -f1)"
if [ "$major" != "13" ]; then
	echo "gcc 主版本為 $major，需要 13" >&2
	exit 2
fi

dir="$(cd "$(dirname "$src")" && pwd)"
name="$(basename "$src" .c)"
cd "$dir" || exit 1

# 課程建議的標準編譯指令（環境建立.md §4.2）
echo "=== 編譯：gcc -Wall -Wextra -std=c11 $name.c -o $name ==="
warnings="$(gcc -Wall -Wextra -std=c11 "$name.c" -o "$name" 2>&1)"
if [ $? -ne 0 ]; then
	echo "$warnings"
	echo "=== 編譯失敗 ==="
	exit 3
fi
echo "=== 警告 ==="
if [ -n "$warnings" ]; then
	echo "$warnings"
else
	echo "（無）"
fi

if [ -n "$input" ]; then
	echo "=== 輸入 ==="
	cat "$input"
	echo "=== 輸出 ==="
	./"$name" < "$input"
else
	echo "=== 輸出 ==="
	./"$name" < /dev/null
fi
code=$?
echo
echo "=== exit code：$code ==="

if [ "$code" -ne 0 ]; then
	exit 5
fi
if [ -n "$warnings" ]; then
	exit 4
fi
exit 0

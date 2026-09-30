---
title: VS Code 裝好了，C 程式還是跑不起來？照症狀找問題
description: gcc 找不到、hello.c 找不到、改了程式卻看到舊輸出？從錯誤訊息找到下一步。
date: 2026-09-30
thumbnail: /images/cs/c-setup-troubleshooting-thumb.webp
tags:
  - windows
  - gcc
  - vscode
  - students
---

VS Code 裝好了，第一支 C 程式卻跑不起來。你可能想把所有工具重裝一次，但先看**卡在哪一步**，通常更快。

| 你看到的狀況 | 先檢查什麼 | 往哪裡看 |
| --- | --- | --- |
| 終端機找不到 `gcc` | GCC 有沒有安裝？它的資料夾有沒有加入 PATH？ | 下方「先讓 gcc 能被找到」 |
| VS Code 沒有 C 語法提示，或不知道按哪個「執行」 | C/C++ 擴充套件與 GCC 各做什麼？ | 下方「別先找執行按鈕」 |
| `hello.c: No such file or directory` | 終端機在哪個資料夾？檔案真的是 `.c` 嗎？ | 下方「找不到 hello.c」 |
| 修改後還是舊輸出 | 有沒有存檔、重新編譯？ | 下方「改了卻沒變」 |

## 指令要在哪裡打？

在 VS Code 用「檔案 → 開啟資料夾」打開準備存放 `hello.c` 的資料夾，再按 `` Ctrl + ` `` 開啟下方終端機，選 **PowerShell**。終端機裡 `PS C:\...>` 是提示字，不用跟著輸入；只打後面的指令。

先打這兩行，一行打完按一次 Enter：

```powershell
pwd
dir
```

`pwd` 顯示你**目前在哪個資料夾**；`dir` 列出這個資料夾裡的檔案。等一下存好 `hello.c` 後，再用 `dir` 確認它出現在這裡。**已經存檔卻看不到**時，再到下方「找不到 hello.c」處理。

## 先讓 gcc 能被找到

**VS Code 是寫程式的地方，GCC 才是把 C 程式變成執行檔的工具。** 裝好 VS Code，不代表 GCC 也裝好了。在剛開的 PowerShell 終端機輸入：

```powershell
gcc --version
```

`gcc` 是要執行的程式，`--version` 是請它顯示版本。依結果往下查：

- **看到版本號**：GCC 找得到，直接往下試 `hello.c`。
- **PowerShell 說找不到 `gcc`**：到檔案總管看看 `C:\msys64\ucrt64\bin\gcc.exe` 在不在。如果不在，依課堂《環境建立》§2.1 的 [MSYS2 安裝步驟](https://www.msys2.org/)安裝，並在 **MSYS2 UCRT64 終端機**（這一步不是在 PowerShell）輸入：

  ```bash
  pacman -S mingw-w64-ucrt-x86_64-gcc
  ```
- **`gcc.exe` 在，但指令仍找不到**：把**資料夾** `C:\msys64\ucrt64\bin` 加到 Windows「使用者變數」的 `Path`，不要加 `gcc.exe` 檔案本身。按 `Win` 搜尋「環境變數」→「環境變數」→ 上方使用者變數的 `Path` →「編輯」→「新增」。

安裝位置不一定是 `C:\msys64`；若你裝在別處，就使用自己電腦上 `gcc.exe` 所在的資料夾。加完 PATH 後，**關閉並重新開啟 PowerShell**，再試 `gcc --version`。如果用的是 VS Code 內建終端機，連 VS Code 也關掉重開。舊視窗還拿著舊的 PATH，改完設定卻沒重開，就會以為設定沒用。

想確認 PowerShell 實際找到哪一個 GCC，可以輸入：

```powershell
where.exe gcc
```

它會列出 `gcc.exe` 的完整路徑；如果沒有列出路徑，就回頭查安裝位置與 PATH。在 PowerShell 要打 `where.exe`，不要只打 `where`。

**想補看 GCC 安裝的課堂影片？** 這裡有〈[Windows GCC 安裝](https://www.youtube.com/watch?v=etqOTrVPQfc)〉。先用上面的 `gcc --version` 判斷自己是否卡在安裝，再決定要不要打開影片。

::youtube-embed{id="etqOTrVPQfc" title="王老師的學習園地：Windows GCC 安裝"}
::

## 別先找「執行」按鈕

VS Code 的 **C/C++** 擴充套件（發行者 Microsoft）提供語法提示、自動補全等功能；它**不會替你安裝 GCC**。Code Runner 可以幫你按一下執行，但也是選用工具。先在終端機把下面這支程式編譯成功，比猜哪個按鈕更容易找到問題。

在 VS Code 用「開啟資料夾」打開放程式的資料夾，建立並**存檔**為 `hello.c`：

```c
#include <stdio.h>

int main(void) {
    printf("Hello, World!\n");
    return 0;
}
```

回到同一個資料夾的 PowerShell 終端機，照順序輸入：

```powershell
gcc -Wall -Wextra -std=c11 hello.c -o hello
.\hello.exe
```

第一行是**編譯**：`gcc` 呼叫編譯器，`hello.c` 是要讀的原始碼，`-o hello` 把產出的程式命名為 `hello`；`-Wall -Wextra` 讓編譯器多提醒常見問題，`-std=c11` 指定課堂使用的 C 標準。編譯成功通常沒有訊息。第二行才是**執行**剛產生的 `hello.exe`；`.\` 表示「就在目前資料夾裡」。應看到 `Hello, World!`。上面的程式已用課程指定的 GCC 13 編譯並執行，沒有警告，輸出也是 `Hello, World!`。

## 有 gcc，卻找不到 `hello.c`

這跟「找不到 gcc」是兩件事。編譯器已經啟動，只是看不到你指定的檔案。我們實測：資料夾裡只有 `hello.c.txt`，卻編譯 `hello.c`，會得到 `hello.c: No such file or directory`。

在 PowerShell 輸入：

```powershell
pwd
dir hello*
```

`pwd` 看目前資料夾；`dir hello*` 列出名稱以 `hello` 開頭的檔案。如果檔案在別的資料夾，用 `cd` 切過去，例如 `cd "C:\cs101\hello"`（換成你自己的路徑），或在 VS Code 用「開啟資料夾」重新打開它。如果看到 `hello.c.txt`，到 Windows 檔案總管開啟「顯示副檔名」，再把檔名改成真正的 `hello.c`。

## 改了程式，執行卻還是舊的

請照這個順序：**修改 → `Ctrl + S` 存檔 → 重新執行 `gcc` 編譯 → 執行 `hello.exe`**。在 PowerShell 重跑上面那兩行指令；按鍵盤的上方向鍵也能叫回上一個指令。編譯器讀的是硬碟上的檔案；執行檔則是上次編譯留下的版本。

我們把程式的輸出從「版本一」改成「版本二」實測：改完但**沒有重新編譯**時，執行檔仍印出「版本一」；重編後才印出「版本二」。所以看到舊結果時，先查存檔和重編，不必急著改程式邏輯。

## 自我檢查

- [ ] `gcc --version` 有顯示版本號嗎？
- [ ] 如果沒有，`gcc.exe` 是否存在？PATH 加的是它所在的**資料夾**嗎？設定後有重開終端機嗎？
- [ ] `hello.c` 在目前的資料夾嗎？副檔名真的是 `.c` 嗎？
- [ ] 改完程式後，有存檔、重新編譯、再執行嗎？

**小練習**：`gcc --version` 正常，但編譯時說 `hello.c: No such file or directory`。你會先重裝 GCC，還是檢查目前資料夾與檔名？

答案：先檢查**目前資料夾與檔名**。GCC 已能執行，問題在它找不到 `hello.c`。

## 還是卡住？

到 [BridgeAI](https://bridgeai.jywglady.org) 開啟 AI 問答，貼上**你輸入的指令、完整錯誤訊息，以及 `hello.c` 所在的資料夾**，比較容易找出卡在哪一步。想知道收到回答後怎麼追問、怎麼驗證，可以看[怎麼和 AI 一來一往地除錯](/blog/ai-debugging-questions)。

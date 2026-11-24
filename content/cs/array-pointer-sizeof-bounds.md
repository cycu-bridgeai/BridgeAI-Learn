---
title: 陣列傳進函式後，sizeof 為什麼算錯了？
description: 陣列傳進函式會變成指向首元素的指標，sizeof 量到的是指標大小不是陣列長度。附 i <= count 越界與 p + 1 位移說明。
date: 2026-11-19
thumbnail: /images/cs/array-pointer-sizeof-bounds-thumb.webp
tags:
  - c
  - array
  - pointer
  - students
---

在 `main` 裡用 `sizeof(readings) / sizeof(readings[0])` 算陣列長度很好用，但不少同學把它搬進函式後就出事了（以下節錄函式與呼叫處，完整可編譯程式見下方解法）：

```c
void print_count(int readings[])
{
    size_t count = sizeof(readings) / sizeof(readings[0]);
    printf("Inside function: count = %zu\n", count);
}

int main(void)
{
    int readings[] = {23, 25, 24};
    size_t count = sizeof(readings) / sizeof(readings[0]);
    printf("In main: count = %zu\n", count);
    print_count(readings);
    return 0;
}
```

**輸出**

```text
In main: count = 3
Inside function: count = 2
```

明明是同一個陣列，進到函式怎麼從 `3` 縮水成 `2`？而且用 `gcc -Wall -Wextra -std=c11` 編譯時，其實已經警告你了：

```text
warning: ‘sizeof’ on array function parameter ‘readings’ will return size of ‘int *’ [-Wsizeof-array-argument]
```

## 為什麼？

在 `main` 裡，`readings` 是貨真價實的陣列（3 個 `int`，共 12 個位元組）。但只要把它傳進函式，陣列名稱就會**轉成指向第 0 格的指標**（相當於 `&readings[0]`）。

所以 `print_count` 的參數寫 `int readings[]` 跟寫 `int *readings` 是同一件事：函式只收到一個**存放位址的指標變數**，不知道陣列有多長。在我們的 64 位元測試環境，指標佔 `8` 個位元組、一格 `int` 佔 `4` 個，所以函式裡永遠算出 `8 / 4 = 2`。

指標加 `1` 也不是位址數字加 1，而是往後跳一格 `int`（4 個位元組），所以 `readings[i]` 和 `*(readings + i)` 指到同一格。

![main 裡的 readings 是連續 3 格共 12 bytes；傳進函式只剩指向第 0 格的指標（8 bytes），每次 p+1 跳 4 bytes，索引 3 已超出陣列](/images/cs/array-pointer-sizeof-bounds-diagram-01.svg)

## 解法

在 `main` 還沒傳進去之前，先用 `sizeof` 算好 `count`，再把**首元素位址**跟**筆數**一起傳給函式：

```c
#include <stdio.h>

void apply_offset(int *readings, size_t count, int offset)
{
    for (size_t i = 0; i < count; ++i) {
        readings[i] += offset;
    }
}

int main(void)
{
    int readings[] = {23, 25, 24};
    size_t count = sizeof(readings) / sizeof(readings[0]);
    int offset = 3;

    apply_offset(readings, count, offset);

    for (size_t i = 0; i < count; ++i) {
        printf("readings[%zu] = %d\n", i, readings[i]);
    }

    return 0;
}
```

**輸出**

```text
readings[0] = 26
readings[1] = 28
readings[2] = 27
```

`sizeof` 會算出資料佔了幾個位元組，`size_t` 是專門接這種大小或筆數的無號整數型別，用 `printf` 印出時要寫 `%zu`。因為傳進函式的是第 0 格的位址，函式裡寫 `readings[i] += offset;` 就能改到 `main` 的每一筆讀值。

## 常見陷阱

**陷阱 1：迴圈條件寫成 `i <= count`。** 把解法裡印出迴圈的 `i < count` 換成 `i <= count`，未開最佳化時編譯**沒有警告**，但多印出第 4 個數字：

```text
readings[0] = 26
readings[1] = 28
readings[2] = 27
readings[3] = 1863715840
```

最後那個數字每次跑都可能不同，你看到的不會跟這裡一樣。3 筆資料的合法索引只有 `0`、`1`、`2`，`readings[3]` 已經在陣列外面：讀到的是雜訊，寫入更可能弄壞別的變數或讓程式當掉。

**陷阱 2：用指標解引用時漏掉括號，寫成 `*readings + i`。** 我們實際跑過 `{23, 25, 24}`：

```text
*(readings + 0) = 23, *readings + 0 = 23
*(readings + 1) = 25, *readings + 1 = 24
*(readings + 2) = 24, *readings + 2 = 25
```

`*` 的優先順序比 `+` 高，不加括號會變成「先取出第 0 格的 `23`，再拿 `23` 去加 `i`」，沒有移動到下一格。要嘛寫 `readings[i]`，要寫指標運算一定要加括號 `*(readings + i)`。

**老師的相關影片：**〈[陣列邊界與常見程式錯誤](https://www.youtube.com/watch?v=Nt7b1nfjzeU)〉

::youtube-embed{id="Nt7b1nfjzeU" title="王老師的學習園地：陣列邊界與常見程式錯誤"}
::

## 自我檢查

- [ ] `sizeof(arr) / sizeof(arr[0])` 只寫在看得到完整陣列的地方（例如 `main`），不寫在函式參數上。
- [ ] 把陣列傳給函式時，另外傳一個 `size_t count` 告訴函式共有幾筆。
- [ ] 迴圈條件寫 `i < count`，不是 `i <= count`。
- [ ] 用指標加法取值時有加括號 `*(p + i)`，不是 `*p + i`。

**小練習**：把解法裡的陣列改成 `{23, 25, 24, 28}`、`offset` 改成 `-2`，再把函式裡的 `readings[i] += offset;` 換成 `*(readings + i) += offset;`，依序會印出哪四個數字？

答案：`21`、`23`、`22`、`26`。`count` 會自動變成 `4`，`*(readings + i)` 跟 `readings[i]` 操作的是同一格。

## 還是卡住？

到 [BridgeAI](https://bridgeai.jywglady.org) 開啟 AI 問答，把你的程式碼、輸入、輸出，**還有編譯時的警告**一起貼上去問；第一次用的話，可以先看[怎麼和 AI 一來一往地除錯](/blog/ai-debugging-questions)。

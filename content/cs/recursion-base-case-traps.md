---
title: 遞迴寫了 if (n == 1)，為什麼還是跑到當掉？
description: 只寫終止條件不夠，問題沒縮小或輸入比 1 小，一樣會無限呼叫。用 sum(4) 實測去程等待與回程加法。
date: 2026-11-19
thumbnail: /images/cs/recursion-base-case-traps-thumb.webp
tags:
  - c
  - recursion
  - function
  - students
---

寫遞迴算 `1 + 2 + … + n` 時，你明明照課本寫好了終止條件 `if (n == 1)`，程式卻一跑就當掉（我們的測試環境顯示 `Segmentation fault`，exit code `139`）：

```c
int sum(int n)
{
    if (n == 1) {
        return 1;
    }

    return sum(n) + n;   /* 少了 - 1 */
}
```

編譯器對這段程式**沒有給任何警告**，但一呼叫 `sum(4)` 就當了。（如果用 `-O2` 開啟最佳化，症狀可能變成卡住不結束。）

## 為什麼？

遞迴能停下來，靠兩件事同時成立：**有終止條件**，而且**每次呼叫都真的往終止條件靠近**。上面的程式把 `n` 原封不動再傳給自己，`sum(4)` 呼叫 `sum(4)`，永遠到不了 `1`。

另外很多同學看不懂 `return sum(n - 1) + n;` 的執行順序。程式遇到 `return` 時，必須先把右邊整個運算式算完。算 `sum(4)` 時，還不知道 `sum(3)` 是多少，所以 `+ 4` 只能先掛著等——就像把還沒做完的工作一層一層疊在桌上，最晚放上去的要先做完，才能繼續處理下面的。這塊暫存區叫做**呼叫堆疊（Call Stack）**，直到最底層的 `sum(1)` 交出 `1`，各層才依**後進先出（LIFO）**的順序從底層一層一層算回來：

![去程時 sum(4) 到 sum(2) 都卡在加法前往下等待；直到 sum(1) 回傳 1 後，回程依序算出 3、6、10](/images/cs/recursion-base-case-traps-diagram-01.svg)

| 呼叫層 | 去程卡住的工作 | 回程算完交出的值 |
| --- | --- | --- |
| `sum(4)` | 等 `sum(3)` 回來再 `+ 4` | `6 + 4 = 10` |
| `sum(3)` | 等 `sum(2)` 回來再 `+ 3` | `3 + 3 = 6` |
| `sum(2)` | 等 `sum(1)` 回來再 `+ 2` | `1 + 2 = 3` |
| `sum(1)` | 符合終止條件，不用等 | `1` |

注意每一層呼叫都有自己那份 `n`：`sum(3)` 在算的時候，`sum(4)` 那層保留的 `n` 依然是 `4`。而且如果呼叫太多層都還沒結束，呼叫堆疊會裝不下，這就叫**堆疊溢位（Stack Overflow）**。

**老師的相關影片：**〈[遞迴的基本概念：函式呼叫自己](https://www.youtube.com/watch?v=HgFTjV8v1KQ)〉

::youtube-embed{id="HgFTjV8v1KQ" title="王老師的學習園地：遞迴的基本概念：函式呼叫自己"}
::

## 解法

在 `main` 先檢查輸入範圍（本練習限定 `1` 到 `100`），確保 `sum(n)` 收到的都是正整數，函式內再用 `n - 1` 讓問題往 `1` 縮小：

```c
#include <stdio.h>

int sum(int n);

int main(void)
{
    int n;
    int result;

    printf("Enter an integer from 1 to 100: ");

    if (scanf("%d", &n) != 1) {
        printf("Input error: an integer is required.\n");
        return 1;
    }

    if (n < 1 || n > 100) {
        printf("Input error: n must be between 1 and 100.\n");
        return 1;
    }

    result = sum(n);

    printf("sum(%d) = %d\n", n, result);

    return 0;
}

int sum(int n)
{
    if (n == 1) {
        return 1;
    }

    return sum(n - 1) + n;
}
```

**輸入** `4` → **輸出** `Enter an integer from 1 to 100: sum(4) = 10`

**輸入** `0` → **輸出** `Enter an integer from 1 to 100: Input error: n must be between 1 and 100.`

## 常見陷阱

**陷阱 1：有寫 `if (n == 1)`，卻在沒檢查下呼叫 `sum(0)`。** 把解法裡 `n < 1 || n > 100` 那段檢查拿掉，直接輸入 `0`。編譯沒警告，但 `sum(0)` 會去呼叫 `sum(-1)`、`sum(-2)`……離 `1` 越來越遠，最後一樣 `Segmentation fault`（exit code `139`；用 `-O2` 時可能變成卡住或印出怪數字）。寫了終止條件，不代表所有輸入都碰得到它。

**陷阱 2：把 `int` 數值溢位當成堆疊溢位。** 把解法的 `sum(n)` 換成算階乘的 `product(n)`（把 `return sum(n - 1) + n;` 改成 `return product(n - 1) * n;`），並在 `main` 改為呼叫 `product`，我們實際跑了兩個輸入：

```text
product(12) = 479001600
product(13) = 1932053504
```

`13!` 其實是 `6227020800`，這裡沒有當掉（exit code `0`），也沒有編譯警告，但答案錯了。這是因為乘積超過 `int` 能裝的最大數字（**數值溢位**），跟遞迴太深爆掉的**堆疊溢位**是兩件不同的事。C 語言沒有規定 `int` 溢位後的結果（未定義行為），所以 `1932053504` 只是我們這次跑出來的數字。

## 自我檢查

- [ ] 終止條件寫完後，再檢查下一行：參數真的有往終止條件縮小嗎（例如 `n - 1`）？
- [ ] 呼叫遞迴前，有先擋掉碰不到終止條件的輸入（例如 `0` 或負數）嗎？
- [ ] 手動追蹤 `sum(4)` 時，能分清楚去程在等誰、回程從哪一層開始算？
- [ ] 結果出現奇怪數字時，分得出來是 `int` 裝不下，還是遞迴沒停？

**小練習**：把解法的 `return sum(n - 1) + n;` 改成 `return sum(n - 2) + n;`，輸入 `5` 和 `4` 分別會發生什麼事？

答案：輸入 `5` 印出 `sum(5) = 9`，因為 `5 → 3 → 1` 剛好碰到終止條件，算的是 `1 + 3 + 5`。輸入 `4` 會 `Segmentation fault`，因為 `4 → 2 → 0 → -2` 跳過了 `1`。

## 還是卡住？

到 [BridgeAI](https://bridgeai.jywglady.org) 開啟 AI 問答，把你的程式碼、輸入、輸出一起貼上去問；第一次用的話，可以先看[怎麼和 AI 一來一往地除錯](/blog/ai-debugging-questions)。

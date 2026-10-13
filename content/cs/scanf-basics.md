---
title: 一行 scanf，每個字在幹嘛？
description: 雙引號、%d、%lf、&，還有 scanf 的回傳值，一次拆給你看。
date: 2026-10-13
thumbnail: /images/cs/scanf-basics-thumb.webp
tags:
  - c
  - scanf
  - students
---

課本裡讀「整數、小數、字元」是這樣寫的。我們把 scanf 的回傳值也一起印出來看：

```c
#include <stdio.h>

int main(void) {
    int n = 0;
    double x = 0;
    char c = '?';
    int r = scanf("%d %lf %c", &n, &x, &c);
    printf("讀到 %d 個：n = %d, x = %f, c = %c\n", r, n, x, c);
    return 0;
}
```

**輸入** `42 3.14 A` → **輸出** `讀到 3 個：n = 42, x = 3.140000, c = A`

能跑，但那行 scanf 裡每個符號在做什麼？我們一個一個拆開。

## 拆開那一行

```text
scanf("%d %lf %c", &n, &x, &c);
      |__________|  |________|
          (1)          (2)
```

**(1) 雙引號裡是「樣板」**：告訴 scanf 輸入長什麼樣子。`%d`、`%lf`、`%c` 各自代表一格要讀的東西，中間的空白會吃掉你輸入的空白。樣板裡如果有逗點這類符號，輸入就一定要有一樣的符號，詳細可以看[範例輸入有逗點，scanf 就讀不到？](/cs/scanf-comma-input)。

**(2) 後面是「要存到哪」**：`&n` 的意思是「讀到的東西放進 `n` 這個箱子」。樣板裡第幾個 `%`，就對到後面第幾個變數，順序和數量都要一樣。printf 只是把值拿出來印，不用 `&`；scanf 要把東西放**進去**，所以要給它箱子的位置。

`%` 後面寫什麼，要看變數是什麼型別。scanf 跟 printf 大部分一樣，**只有 `double` 不一樣**：

| 變數型別 | scanf 讀入 | printf 印出 | 例子 |
|---|---|---|---|
| `int` | `%d` | `%d` | `42` |
| `double` | **`%lf`** | `%f` | `3.14` |
| `float` | `%f` | `%f` | `3.14` |
| `char` | `%c` | `%c` | `A` |

**老師的相關影片：**〈[變數與資料型別](https://www.youtube.com/watch?v=RuQpbmNk5Zk)〉，這支影片的主題就是型別，格式符號就是從型別來的。

::youtube-embed{id="RuQpbmNk5Zk" title="王老師的學習園地：變數與資料型別"}
::

## scanf 還會回報「讀到幾個」

上面的 `r` 就是 scanf 的回傳值：**成功讀進幾個變數，就回傳幾**。如果輸入打錯，用同一支程式：

**輸入** `abc` → **輸出** `讀到 0 個：n = 0, x = 0.000000, c = ?`

`abc` 不是整數，第一格就對不上，scanf 馬上停下來，三個變數都還是原本的值。所以上課程式裡常看到這種寫法：

```c
if (scanf("%d", &N) != 1) {
```

意思是「沒有剛好讀到 1 個整數，就當作輸入有問題」。

## 自我檢查

- [ ] 樣板裡有幾個 `%`，後面就有幾個變數，而且順序一樣。
- [ ] scanf 的每個變數前面都有 `&`。
- [ ] `double` 用 `%lf` 讀、用 `%f` 印。
- [ ] 不確定有沒有讀到？把回傳值印出來看。

**小練習**：要讀「年齡（整數）和身高（小數）」，輸入是 `19 172.5`，scanf 要怎麼寫？成功時回傳值是多少？

答案：`scanf("%d %lf", &age, &height);`，成功時回傳 `2`。

## 還是卡住？

想知道 scanf 寫錯時會發生什麼事，可以看[scanf 最常踩的 4 個坑](/cs/scanf-common-mistakes)。或者到 [BridgeAI](https://bridgeai.jywglady.org) 開啟 AI 問答，把你的程式碼、輸入和輸出貼上去問；第一次用的話，可以先讀[怎麼和 AI 一來一往地除錯](/blog/ai-debugging-questions)。

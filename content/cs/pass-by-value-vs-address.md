---
title: 函式裡明明改了數字，回到 main 怎麼還是 5？
description: C 語言傳參數一律複製一份。想讓函式改到呼叫端的變數，要傳 &offset 位址進去，再用 *target 寫回。
date: 2026-11-19
thumbnail: /images/cs/pass-by-value-vs-address-thumb.webp
tags:
  - c
  - pointer
  - function
  - students
---

你要寫一個函式把感測器校正值 `5` 往下調整 `2`。程式看起來很合理（以下節錄函式與呼叫處，完整可編譯程式見下方解法）：

```c
void adjust_by_value(int value, int delta)
{
    value += delta;
    printf("Inside: %d\n", value);
}

int main(void)
{
    int offset = 5;
    adjust_by_value(offset, -2);
    printf("In main: %d\n", offset);
    return 0;
}
```

用 `gcc -Wall -Wextra -std=c11` 編譯沒有警告，實際跑起來卻長這樣：

```text
Inside: 3
In main: 5
```

函式裡面明明印出 `3` 了，回到 `main` 怎麼還是 `5`？

## 為什麼？

C 語言呼叫函式時，參數一律是**傳值（call by value）**——也就是把變數裡的東西「影印一份」交給函式。

`adjust_by_value(offset, -2)` 交出去的是數字 `5` 的複製品。函式裡的 `value` 和 `main` 裡的 `offset` 是兩個獨立的盒子，你在影印紙上把 `5` 改成 `3`，`main` 那格的數字不會變。

想讓函式改到 `main` 的變數，就得把「門牌位址」當成值傳過去。也就是改寫成 `adjust_offset`，呼叫時用 `&offset` 取得位址、函式參數用 `int *target` 接住它，最後透過 `*target += delta;` 順著位址改回本尊。（還不熟 `&` 與 `*` 的符號差別，可以先看[int *p 的 * 跟 *p = 8 的 *，為什麼意思不一樣？](/cs/pointer-basics-dereference)。）

![左邊傳入整數值只複製了 5，函式結束後 main 仍是 5；右邊傳入 &offset 交給指標 target，順著位址把 main 裡的 5 改成 3](/images/cs/pass-by-value-vs-address-diagram-01.svg)

| 呼叫寫法 | 函式收到什麼 | 函式內操作 | `main` 裡的 `offset` |
| --- | --- | --- | --- |
| `adjust_by_value(offset, -2)` | 數字 `5` 的複製品 | `value += delta;` | 還是 `5` |
| `adjust_offset(&offset, -2)` | `offset` 的門牌位址 | `*target += delta;` | 變成 `3` |

**老師的相關影片：**〈[參數、回傳值與傳值呼叫](https://www.youtube.com/watch?v=LsfoSwV-dkk)〉

::youtube-embed{id="LsfoSwV-dkk" title="王老師的學習園地：參數、回傳值與傳值呼叫"}
::

## 解法

把呼叫端改傳 `&offset`，函式參數改成 `int *target`，並在寫入前先擋掉 `NULL`（空指標，代表沒有指向任何有效位址）：

```c
#include <stdio.h>

void adjust_by_value(int value, int delta)
{
    value += delta;
    printf("Inside adjust_by_value: %d\n", value);
}

void adjust_offset(int *target, int delta)
{
    if (target == NULL) {
        return;
    }

    *target += delta;
}

int main(void)
{
    int offset = 5;

    adjust_by_value(offset, -2);
    printf("After passing an int: %d\n", offset);

    adjust_offset(&offset, -2);
    printf("After passing an address: %d\n", offset);

    adjust_offset(NULL, -2);
    printf("After passing NULL: %d\n", offset);

    return 0;
}
```

**輸出**

```text
Inside adjust_by_value: 3
After passing an int: 5
After passing an address: 3
After passing NULL: 3
```

`adjust_offset(&offset, -2)` 執行後，`main` 裡的 `offset` 就變成 `3` 了；最後傳入 `NULL` 時，`if (target == NULL)` 立刻 `return;`，程式平安跑到結束。

## 常見陷阱

**陷阱 1：呼叫時忘了寫 `&`。** 把解法裡 `adjust_offset(&offset, -2);` 換成 `adjust_offset(offset, -2);`。編譯會立刻跳出警告：

```text
warning: passing argument 1 of ‘adjust_offset’ makes pointer from integer without a cast [-Wint-conversion]
```

**輸出** `Segmentation fault`（exit code `139`）。把整數 `5` 當位址傳進去，函式一寫 `*target` 就當掉。

**陷阱 2：函式裡忘了寫 `*`。** 把 `*target += delta;` 換成 `target += delta;`。這行編譯**沒有任何警告**，但最後兩行輸出都變成了 `5`（`After passing an address: 5` 與 `After passing NULL: 5`）。因為少了 `*`，你改的是函式裡複製品 `target` 自己存的位址，根本沒有順著位址寫進 `offset` 的格子裡。

**陷阱 3：沒先檢查 `NULL`。** 把 `if (target == NULL) { return; }` 拿掉後再傳 `NULL` 進來，一樣是編譯沒警告，執行卻出現 `Segmentation fault`。`NULL` 檢查一定要放在 `*target` 之前。

## 自我檢查

- [ ] 函式需要修改呼叫端的變數時，參數型別有寫成指標（例如 `int *target`）嗎？
- [ ] 呼叫函式時，變數前面有加上 `&` 取位址嗎？
- [ ] 函式裡面改值時，指標變數前面有加上 `*` 解引用嗎？
- [ ] 使用 `*target` 之前，有先寫 `if (target == NULL) return;` 嗎？

**小練習**：在解法程式裡，如果從 `offset = 5` 開始，依序呼叫 `adjust_offset(&offset, 4);` 和 `adjust_offset(&offset, -3);`，最後再呼叫一次 `adjust_offset(NULL, 10);`，每次呼叫後印出 `offset`，會依序印出哪三個數字？

答案：`9`、`6`、`6`。前兩次順著位址先加 4 再減 3，第三次傳 `NULL` 直接 `return`，不會動到 `offset`。

## 還是卡住？

到 [BridgeAI](https://bridgeai.jywglady.org) 開啟 AI 問答，把你的程式碼、輸入、輸出，**還有編譯時的警告**一起貼上去問；第一次用的話，可以先看[怎麼和 AI 一來一往地除錯](/blog/ai-debugging-questions)。

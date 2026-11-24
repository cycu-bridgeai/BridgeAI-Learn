---
title: int *p 的 * 跟 *p = 8 的 *，為什麼意思不一樣？
description: 宣告指標、取址 &、解引用 *p 一次搞懂；順便看未初始化或 NULL 指標直接 *p 會發生什麼事。
date: 2026-11-19
thumbnail: /images/cs/pointer-basics-dereference-thumb.webp
tags:
  - c
  - pointer
  - students
---

剛學指標時，這兩行長得幾乎一樣，卻最容易讓人看昏：

```c
int *p = &offset;
*p = 8;
```

兩行都有 `*`，到底哪個是「宣告指標」，哪個是「去改裡面的數字」？還有同學以為先把指標設成 `NULL` 就安全了，沒指向任何變數就直接寫：

```c
int *p = NULL;
*p = 8;
printf("%d\n", *p);
```

用 `gcc -Wall -Wextra -std=c11` 編譯完全沒有警告，一跑卻當掉（我們的測試環境顯示 `Segmentation fault`，exit code `139`）。

## 為什麼？

先分清楚兩件事：**變數裡裝的值**，和**變數住在記憶體的哪個位址**。

`int offset = 5;` 會開一個整數盒子裝 `5`；`&offset` 是問這個盒子的門牌位址。`int *p` 則是開一個專門**裝門牌位址**的指標盒子。兩行裡的 `*` 工作不一樣：

- **宣告時**寫 `int *p`：這裡的 `*` 是在告訴編譯器「`p` 是指標，裡面要放 `int` 的位址」。
- **使用時**寫 `*p = 8`：這裡的 `*` 叫做**解引用（dereference）**，意思是「順著 `p` 裡面的位址走過去，把那個格子改成 `8`」。

![offset 是裝數字 5 的盒子，&offset 取出位址存進 p；*p 則順著 p 的位址直接讀寫 offset 裡的值](/images/cs/pointer-basics-dereference-diagram-01.svg)

對照下面四種寫法，寫程式時先對一下你想拿「門牌」還是「盒子裡的數字」：

| 寫法 | 意思 | 目前讀到什麼 |
| --- | --- | --- |
| `offset` | 直接看變數裡的值 | `5` |
| `&offset` | 取得 `offset` 的位址 | `offset` 的門牌位址 |
| `p` | 讀出指標裡存的位址 | 等於 `&offset` |
| `*p` | 順著 `p` 的位址進去讀寫 | `5`（可讀取也能改成 `8`） |

## 解法

還沒有要指向誰時，先用 `int *p = NULL;` 初始化，拿到有效位址（像 `p = &offset;`）之後，再用 `*p` 讀寫。之後也能用 `p = &backup_offset;` 把 `p` 改指到另一個變數：

```c
#include <stdio.h>

int main(void)
{
    int offset = 5;
    int backup_offset = 2;
    int *p = NULL;

    p = &offset;
    printf("Before: offset = %d, *p = %d\n", offset, *p);

    *p = 8;
    printf("After:  offset = %d, *p = %d\n", offset, *p);

    p = &backup_offset;
    *p = 10;
    printf("Switch: offset = %d, backup_offset = %d, *p = %d\n", offset, backup_offset, *p);

    return 0;
}
```

**輸出**

```text
Before: offset = 5, *p = 5
After:  offset = 8, *p = 8
Switch: offset = 8, backup_offset = 10, *p = 10
```

`p = &backup_offset;` 改的是指標 `p` 自己的指向，原本的 `offset` 還是 `8`；接著 `*p = 10;` 才會順著新的指向把 `backup_offset` 改成 `10`。想知道函式怎麼利用這個機制改動外面的變數，可以接續看[函式裡明明改了數字，回到 main 怎麼還是 5？](/cs/pass-by-value-vs-address)。

## 常見陷阱

**陷阱 1：宣告 `int *p;` 沒初始化就寫 `*p = 8;`。** 單獨測這三行 `int *p; *p = 8; printf("%d\n", *p);`，編譯馬上跳出警告：

```text
warning: ‘p’ is used uninitialized [-Wuninitialized]
```

我們實際跑這三行，印出了 `8`（exit code `0`），看起來很正常；加上 `-O2` 再編譯一次，同一段程式就變成 `Segmentation fault`。這就是**未定義行為**：`p` 裡裝的是殘留的位址，跑出什麼結果都沒有保證。

**陷阱 2：忘了 `&`，寫成 `int *p = offset;`。** 如果把解法的 `int *p = NULL;` 和 `p = &offset;` 合併寫成 `int *p = offset;`（把整數 `5` 直接塞給指標變數），編譯會警告：

```text
warning: initialization of ‘int *’ from ‘int’ makes pointer from integer without a cast [-Wint-conversion]
```

**輸出** `Segmentation fault`（exit code `139`）。程式把數字 `5` 當成記憶體門牌去找，那個位址不能存取，程式就當掉了。

**陷阱 3：指標還是 `NULL` 就急著 `*p`。** 開頭的例子就是這個坑：`NULL` 代表現在沒有指向任何變數，不能解引用。

## 自我檢查

- [ ] 宣告 `int *p = NULL;` 時先想清楚：`*` 是型別標記，不是解引用。
- [ ] 確定 `p` 已經被賦予有效位址（例如 `p = &offset;`），才寫 `*p`。
- [ ] 看到 `-Wuninitialized` 或 `-Wint-conversion` 警告就停下來修，不要抱僥倖去跑。

**小練習**：接在解法最後，如果再寫一行 `p = &offset;`，這時候印出 `*p` 會是多少？

答案：`8`。`backup_offset` 改成 `10` 時沒有動到 `offset`，把 `p` 指回 `&offset` 後讀到的仍是 `8`。

## 還是卡住？

到 [BridgeAI](https://bridgeai.jywglady.org) 開啟 AI 問答，把你的程式碼、輸入、輸出，**還有編譯時的警告**一起貼上去問；第一次用的話，可以先看[怎麼和 AI 一來一往地除錯](/blog/ai-debugging-questions)。

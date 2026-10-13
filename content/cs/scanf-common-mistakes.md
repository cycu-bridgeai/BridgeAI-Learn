---
title: scanf 最常踩的 4 個坑
description: 漏了 &、double 用 %f、整數讀到小數、%c 讀到空白：每個坑都實際跑給你看，附上怎麼改。
date: 2026-10-13
thumbnail: /images/cs/scanf-common-mistakes-thumb.webp
tags:
  - c
  - scanf
  - students
---

scanf 寫錯，常常**不會編譯失敗**，程式照樣跑，只是答案怪怪的。下面 4 個坑都是我們實際用 `gcc -Wall -Wextra -std=c11` 編譯、執行過的結果，看看你中了哪一個。還不熟 scanf 每個符號的意思，可以先看[一行 scanf，每個字在幹嘛？](/cs/scanf-basics)。

## 坑 1：變數前面漏了 `&`

```c
int n = 0;
scanf("%d", n);      /* 少了 & */
```

**輸入** `42` → 程式**直接當掉**，什麼都沒印出來（我們的測試環境顯示 `Segmentation fault`）。

scanf 需要知道「要放進哪個箱子」，`&n` 才是箱子的位置；只寫 `n`，給的是箱子裡的值 `0`，scanf 就把 `0` 當成位置去放，當然出事。其實編譯時已經有警告：

```text
warning: format ‘%d’ expects argument of type ‘int *’, but argument 2 has type ‘int’ [-Wformat=]
```

**改法**：`scanf("%d", &n);`

## 坑 2：`double` 用 `%f` 讀

```c
double x = 0;
scanf("%f", &x);     /* double 要用 %lf */
```

**輸入** `3.14` → **輸出** `x = 0.000000`

`%f` 是給 `float` 用的，`double` 要用 `%lf`。printf 印 `double` 寫 `%f` 沒問題，但 scanf 不行。編譯器也有提醒，最後一行甚至直接告訴你答案：

```text
warning: format ‘%f’ expects argument of type ‘float *’, but argument 2 has type ‘double *’ [-Wformat=]
      |            %lf
```

**改法**：`scanf("%lf", &x);`

## 坑 3：用 `%d` 讀到小數

```c
int n = 0;
double x = 0;
scanf("%d", &n);
scanf("%lf", &x);
```

**輸入** `1.5` → **輸出** `n = 1, x = 0.500000`

`%d` 只讀整數，讀到 `1` 碰到小數點就停了，`.5` **留在原地**，下一個 scanf 一來就把它讀走。所以這個坑會害到兩個變數：`n` 少了 `.5`，`x` 也讀到不該讀的東西。

**改法**：會有小數的資料，變數用 `double`、scanf 用 `%lf`。

## 坑 4：`%c` 讀到空白

```c
scanf("%d %lf%c", &n, &x, &c);   /* %lf 和 %c 中間沒空白 */
```

**輸入** `42 3.14 A` → **輸出** `n = 42, x = 3.140000, c = [ ]`

`%d` 和 `%lf` 會自己跳過前面的空白，**`%c` 不會**：空白也是一個字元，`%c` 就乖乖讀了那個空白。（我們把 `c` 印在中括號裡，才看得出是空白。）

**改法**：`%c` 前面加一個空白，`scanf("%d %lf %c", &n, &x, &c);`，樣板裡的空白會先把輸入的空白吃掉。

## 看到警告先別急著執行

坑 1、坑 2 編譯時都有 `warning`，坑 3、坑 4 則連警告都沒有。所以兩件事都要做：

- [ ] 編譯有 `warning: format` 就回來對照坑 1、坑 2，`argument 2` 指的是 scanf 括號裡第 2 個東西。
- [ ] 沒有警告也要拿範例輸入跑一次，把讀到的變數印出來，看是不是你以為的值。

**老師的相關影片：**〈[型別轉換與結果檢查](https://www.youtube.com/watch?v=WLOLlPm1Meo)〉，主題是型別和結果檢查，跟上面「印出來檢查」是同一件事。

::youtube-embed{id="WLOLlPm1Meo" title="王老師的學習園地：型別轉換與結果檢查"}
::

**小練習**：下面這行有幾個坑？`scanf("%d %f", age, &height);`（`age` 是 `int`，`height` 是 `double`）

答案：兩個。`age` 前面漏了 `&`（坑 1），`height` 是 `double` 要用 `%lf`（坑 2）。改成 `scanf("%d %lf", &age, &height);`。

## 還是卡住？

到 [BridgeAI](https://bridgeai.jywglady.org) 開啟 AI 問答，把你的程式碼、輸入、輸出，**還有編譯時的警告**一起貼上去問；第一次用的話，可以先讀[怎麼和 AI 一來一往地除錯](/blog/ai-debugging-questions)。

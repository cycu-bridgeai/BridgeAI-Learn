---
title: 判斷質數，576 卻說是質數？return 放錯地方了
description: 因數數到 2 個就 return，迴圈還沒跑完函式就先結束了。用 576 實際跑一次，看判斷該搬到哪裡。
date: 2026-10-27
thumbnail: /images/cs/return-inside-loop-trap-thumb.webp
tags:
  - c
  - loop
  - function
  - students
---

判斷質數，你可能會這樣想：從 1 數到 n，能整除就把 `factor` 加 1，**剛好 2 個因數**就是質數。想法完全正確，但如果你把判斷也寫進迴圈裡：

```c
int isPrime(int n)
{
    int factor = 0;

    for (int i = 1; i <= n; i++) {
        if (n % i == 0) {
            factor++;
        }

        if (factor == 2) {
            return 1;
        }
    }

    return 0;
}
```

主程式讀一個整數，`isPrime` 回傳 1 就印「是質數」，否則印「不是質數」。跑跑看：

**輸入** `576` → **輸出** `576 是質數`

576 明明是 24 × 24。我們再試了 9，一樣說 `9 是質數`；只有 1 會回答「不是質數」。其實 2 以上的整數它全部都說是質數：1 一定能整除，再遇到下一個能整除的數（最晚就是 n 自己），`factor` 就湊滿 2 個了。

## 為什麼？

我們在 `factor++` 那段後面多印一行 `i` 和 `factor`，再跑一次 576：

```text
i = 1, factor = 1
i = 2, factor = 2
576 是質數
```

`i = 2` 時 `factor` 變成 2，`if (factor == 2)` 成立，`return 1` 一執行，**整個函式就結束了**。後面的 3、4、6、8……根本沒機會被檢查。老師在〈參數、回傳值與傳值呼叫〉講過：`return` 會結束當次函式執行，寫在它後面的敘述不會執行。迴圈也一樣，`return` 之後就沒有下一輪了。

換個說法：迴圈裡面是「數的過程」，這時候的 `factor` 只是**目前數到幾個**；要等迴圈的 `}` 結束，`factor` 才是**總共有幾個**。「剛好 2 個」問的是總數，只能數完才問。

| 位置 | `factor` 的意思 | 能不能問「剛好 2 個嗎」 |
|---|---|---|
| 迴圈 `{ }` 裡面 | 目前為止數到幾個 | 不能，還沒數完 |
| 迴圈 `}` 後面 | 總共有幾個 | 可以 |

**老師的相關影片：**〈[參數、回傳值與傳值呼叫](https://www.youtube.com/watch?v=LsfoSwV-dkk)〉，主題就是 `return` 做了什麼事。

::youtube-embed{id="LsfoSwV-dkk" title="王老師的學習園地：參數、回傳值與傳值呼叫"}
::

## 解法

把 `if (factor == 2)` 搬到迴圈的 `}` 外面：迴圈裡只負責數，數完再判斷。

```c
#include <stdio.h>

int isPrime(int n)
{
    int factor = 0;

    for (int i = 1; i <= n; i++) {
        if (n % i == 0) {
            factor++;
        }
    }

    if (factor == 2) {
        return 1;
    } else {
        return 0;
    }
}

int main(void)
{
    int n;

    scanf("%d", &n);

    if (isPrime(n) == 1) {
        printf("%d 是質數\n", n);
    } else {
        printf("%d 不是質數\n", n);
    }

    return 0;
}
```

**輸入** `576` → **輸出** `576 不是質數`　**輸入** `7` → **輸出** `7 是質數`

想看清楚的話，在 `if (factor == 2)` 前面印出 `factor`，576 會印出 `factor = 21`。576 其實有 21 個因數，舊的寫法數到第 2 個就交卷了。

## 反過來寫，就可以放在迴圈裡

同樣是迴圈裡的 `return`，換個方向就沒問題。在解法的迴圈裡、`factor++` 那段後面加上：

```c
        if (factor > 2) {
            return 0;
        }
```

**輸入** `576` → **輸出** `576 不是質數`　**輸入** `7` → **輸出** `7 是質數`

差別在於：一數到第 3 個因數，就**確定**不是質數了，後面不用再數；但「是質數」還是要等全部數完才能說，所以 `return 1` 照樣留在迴圈外。什麼時候 `return` 可以放迴圈裡，下一篇[迴圈裡可以寫 return 嗎？一票否決 vs 總結清算](/cs/return-fail-fast-vs-summary)會整理成判斷方法。

## 自我檢查

- [ ] 每寫一個 `return`，先問：程式跑到這裡時，迴圈跑完了嗎？
- [ ] 判斷「總共幾個」「總和多少」的 `if`，寫在迴圈的 `}` 外面。
- [ ] 不要只拿質數測。錯誤寫法輸入 7、2 都答對，要拿 9、576 這種合成數才抓得到。

**小練習**：開頭的錯誤寫法，輸入 `9` 會印出什麼？

答案：`9 是質數`。`i = 1` 時 `factor` 是 1，`i = 3` 時變成 2，馬上 `return 1`。

## 還是卡住？

到 [BridgeAI](https://bridgeai.jywglady.org) 開啟 AI 問答，把你的程式碼、輸入、輸出一起貼上去問；第一次用的話，可以先讀[怎麼和 AI 一來一往地除錯](/blog/ai-debugging-questions)。

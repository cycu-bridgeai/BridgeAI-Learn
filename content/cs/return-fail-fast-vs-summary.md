---
title: 迴圈裡可以寫 return 嗎？一票否決 vs 總結清算
description: 看到一個就能下結論，return 可以放迴圈裡；要算總數、總和，就一定要等迴圈跑完。附一張判斷清單。
date: 2026-10-27
thumbnail: /images/cs/return-fail-fast-vs-summary-thumb.webp
tags:
  - c
  - loop
  - function
  - students
---

上一篇[判斷質數，576 卻說是質數？](/cs/return-inside-loop-trap)說判斷要放在迴圈外。可是你可能也看過 `return` 寫在迴圈裡、而且是對的程式。到底能不能放？

答案是看題目。每次想在迴圈裡寫 `return`，先問自己一句：**看到這一個，就能確定答案嗎？**

## 為什麼？兩種題目

| | 一票否決 | 總結清算 |
|---|---|---|
| 題目在問 | 有沒有任何一個…？ | 總共幾個、總和多少、最大是誰 |
| 看到一個就能確定？ | 能，找到就可以走 | 不能，要全部看完 |
| `return` 放哪 | 否決：迴圈裡；通過：迴圈外 | 只能放迴圈外 |
| 例子 | 判斷質數：找到一個能整除的就不是 | 因數個數、因數總和、最高溫 |

![一票否決的迴圈有兩個出口，中途找到整除就 return 0，跑完才 return 1；總結清算的迴圈裡沒有出口，跑完才 return sum](/images/cs/return-fail-fast-vs-summary-diagram-01.svg)

注意一票否決其實有**兩個出口**：「否決」可以在迴圈裡，找到就走；「通過」一定在迴圈外，因為還沒看完所有人，不能說「沒人反對」。總結清算只有一個出口，迴圈裡只負責累加。〈應用：感測資料統計〉的最高溫程式也是這樣：迴圈裡只更新最大值，印出結果的 `printf` 寫在迴圈後面。

## 解法

同一支程式放兩個函式，`isPrime` 是一票否決，`sumOfFactors` 是總結清算。這裡的 `isPrime` 換了一種寫法：上一篇是數完所有因數、看是不是剛好 2 個；這次改成找有沒有「1 和 n 以外」的因數，找到一個就能下結論，不用全部數完。

```c
#include <stdio.h>

int isPrime(int n)
{
    if (n < 2) {
        return 0;
    }

    for (int i = 2; i < n; i++) {
        if (n % i == 0) {
            return 0;
        }
    }

    return 1;
}

int sumOfFactors(int n)
{
    int sum = 0;

    for (int i = 1; i <= n; i++) {
        if (n % i == 0) {
            sum += i;
        }
    }

    return sum;
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

    printf("因數總和：%d\n", sumOfFactors(n));

    return 0;
}
```

**輸入** `576` → **輸出**

```text
576 不是質數
因數總和：1651
```

**輸入** `7` → **輸出**

```text
7 是質數
因數總和：8
```

`isPrime` 從 2 數到 n-1，因為 1 和 n 本來就一定能整除，不用看；中間只要有一個能整除，就 `return 0`。迴圈整個跑完都沒人能整除，才走到最後的 `return 1`。

## 常見陷阱

**陷阱 1：「通過」也寫進迴圈。** 把 `isPrime` 迴圈裡的 `if` 換成：

```c
        if (n % i == 0) {
            return 0;
        } else {
            return 1;
        }
```

**輸入** `9` → **輸出** 第一行變成 `9 是質數`。`i = 2` 時 9 不能被 2 整除，直接 `return 1`，3 根本沒被檢查到。只問了一個人，就宣布全體通過。

**陷阱 2：`return sum` 寫進迴圈。** 把 `sumOfFactors` 的迴圈換成：

```c
    for (int i = 1; i <= n; i++) {
        if (n % i == 0) {
            sum += i;
        }

        return sum;
    }
```

**輸入** `576` → **輸出** 第二行變成 `因數總和：1`。我們實際跑了 576、7、9，答案全都是 1：第一輪加了 1 就交卷。

這兩個陷阱編譯時**都沒有警告**，只能靠測試抓出來。

順帶一提，〈break - continue 與流程追蹤〉提醒過：`break` 是離開迴圈，跟 `return` 影響的範圍不同。`break` 之後，迴圈後面的程式還會繼續跑；`return` 是整個函式直接結束。在判斷函式裡一票否決，用 `return 0` 最直接。

**老師的相關影片：**〈[迴圈：break continue](https://www.youtube.com/watch?v=HxSHwH77yA0)〉，主題是怎麼提早離開迴圈。

::youtube-embed{id="HxSHwH77yA0" title="王老師的學習園地：迴圈：break continue"}
::

## 自我檢查

- [ ] 題目問「有沒有任何一個」→ 一票否決：找到就 `return`，「通過」寫在迴圈外。
- [ ] 題目問「總共幾個、總和、最大最小」→ 總結清算：迴圈裡只累加，`return` 寫在迴圈外。
- [ ] 迴圈裡的每個 `return` 都問一次：看到這一個，答案就確定了嗎？
- [ ] 除了質數，也要拿合成數（9、576）測，錯誤寫法常常用質數測不出來。

**小練習**：寫一個 `countEven(n)`，算 1 到 n 裡面有幾個偶數。`return` 要放在哪裡？

答案：這是總結清算，要全部數完才知道，所以 `return` 放迴圈外：

```c
int countEven(int n)
{
    int count = 0;

    for (int i = 1; i <= n; i++) {
        if (i % 2 == 0) {
            count++;
        }
    }

    return count;
}
```

**輸入** `10` → **輸出** `5`

## 還是卡住？

到 [BridgeAI](https://bridgeai.jywglady.org) 開啟 AI 問答，把你的程式碼、輸入、輸出一起貼上去問；第一次用的話，可以先讀[怎麼和 AI 一來一往地除錯](/blog/ai-debugging-questions)。

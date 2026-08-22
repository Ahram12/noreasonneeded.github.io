---
layout: post
title: "A Second Mathematical Thought"
date: 2026-08-22
---

## A useful limit

```python
def fibonacci(n):
    a, b = 0, 1

    for _ in range(n):
        a, b = b, a + b

    return a
```

### Theorem

<div class="theorem"> For $x \ne 0$,

$$
\lim_{x\to 0}\frac{\sin x}{x}=1.
$$

</div>

### Proof

<div class="proof">

We begin with the squeeze theorem...

$$
\cos x \leq \frac{\sin x}{x} \leq 1.
$$

Therefore, taking the limit gives the result.

</div>

### Example

<div class="example">
Consider

$$
f(x)=x^2.
$$

Then...

</div>
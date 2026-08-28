---
layout: post
title: "Algorithms for Computing Moments of Binomial RVs"
date: 2026-08-22 10:00:00 -0700
categories: mathematics
---
A standard introduction to Probability often asks students to tediously compute various moments of distributions by hand, only to later tell them about things like Moment Generating Functions (MGFs). In general, they are a superior tool, however, some distributions actually allow for fairly clean recursive expositions without resorting to that machinery. To that point, in this post, our goal will be: given a Binomal Random Variable, with fixed support and probabilty, to describe a recursion for computing its moments.

### Definition

<div class="definition"> 

If a random variable $X$ follows the Binomial distribution then there exist parameters $$ n \in \mathbb{N}, p \in [0,1]$$ such that for any $ 0 \leq j \leq n,$ $$ P(X = j) = \binom{n}{j}p^{j}(1 - p)^{n - j}.$$ Equivalently, $X$  is the sum of $n$ i.i.d Bernoulli Random variables that each have an individual probability $p$ of occurring.  

</div>

The quanity we are interested in computing is
$ \mathbb{E}(X^{k}) $ for $k \in \mathbb{N}$. For example, for $k = 0$ we $ \mathbb{E}(X^{k})  = 1$ and for $k = 1$ we have $ \mathbb{E}(X^{k})  = np$. Next, we'll first introduce some notation by defining $S(n, k) = \mathbb{E}(X^{k})$ and compute $S(n,k)$ two different ways. 

### Lemma

<div class="definition"> 
For $ n, k \in \mathbb{N}_{>0},$ 
$$S(n,k) = np\sum_{j = 0}^{k - 1}S(n - 1, j)\binom{k - 1}{j}. $$
</div>

### Proof

<div class="proof">

We begin with the definition of $S(n,k)$, we have:
$$
\begin{align}
S(n, k) &= \mathbb{E}(X^{k}) \\
&= \sum_{m=0}^{n}m^{k}\binom{n}{m}p^{m}(1-p)^{n - m} \\ 
&= \sum_{m=0}^{n}m^{k - 1}m\binom{n}{m} p^{m}(1-p)^{n - m}\\ 
&= \sum_{m=1}^{n}m^{k - 1}n\binom{n - 1}{m - 1} p^{m}(1-p)^{n - m}\\
&= np\sum_{m=1}^{n}m^{k - 1}\binom{n - 1}{m - 1}p^{m - 1}(1-p)^{(n - 1) - (m - 1)}
\end{align}
$$

Next, using the Binomial Theorem we have:
$$
\begin{align}
\sum_{m=1}^{n}m^{k - 1}\binom{n - 1}{m - 1}p^{m - 1}(1-p)^{(n - 1) - (m - 1)} &= \sum_{m=1}^{n}\left[\sum_{j=0}^{k - 1}(m - 1)^{j}\binom{k - 1}{j}\right]\binom{n - 1}{m - 1}p^{m - 1}(1-p)^{(n - 1) - (m - 1)} \\
&= \sum_{j=0}^{k - 1}\left[\sum_{m=1}^{n}(m-1)^{j}\binom{n - 1}{m - 1}p^{m - 1}(1-p)^{(n - 1) - (m - 1)}\right]\binom{k - 1}{j} \\
&= \sum_{j = 0}^{k - 1}S(n - 1, j)\binom{k - 1}{j},
\end{align}
$$
as desired. 
</div>

This gives us a $\mathcal{O}(nk^{2})$ algorithm for determining our moments. We'll now determine a second representation for $S(n,k)$ using conditional expectation combined with our previous observation that the binoimal is a sum of i.i.d Bernoulli Random variables. 

### Lemma

<div class="definition"> 
For $ n, k \in \mathbb{N}_{>0},$ 
$$S(n,k) = p\sum_{j = 0}^{k - 1}S(n - 1, j)\binom{k}{j} + S(n- 1, k) $$
</div>

### Proof

<div class="proof">

If we let $B_{i}$ denote the i.i.d Bernoulli Random variables mentioned above, we have: 
$$
\begin{align}
S(n,k) &= \mathbb{E}(X^{k}) \\
       &= \mathbb{E}((B_{1} + B_{2} +...+B_{n-1} + B_{n})^{k})\\
       &= \mathbb{E}((B_{1} + B_{2} +...+B_{n-1} + 1)^{k})p + \mathbb{E}((B_{1} + B_{2} +...+B_{n-1})^{k})(1-p)\\
       &= p\sum_{j=0}^{k} \mathbb{E}((B_{1} + B_{2} +...+B_{n-1})^j)\binom{k}{j} + (1-p)S(n-1, k)\\
       &= p\sum_{j=0}^{k}S(n-1,j)\binom{k}{j} + (1-p)S(n-1, k)\\ 
       &= p\sum_{j = 0}^{k - 1}S(n - 1, j)\binom{k}{j} + S(n- 1, k),

\end{align}
$$
as claimed.
</div>

This is again another $\mathcal{O}(nk^{2})$ algorithm. So, it seems like we're going in circles, however, setting our two representations equal to one another (and re-indexing) we get:

$$ p\sum_{j = 0}^{k - 1}S(n, j)\binom{k}{j} + S(n, k) = (n + 1)p\sum_{j = 0}^{k - 1}S(n, j)\binom{k - 1}{j}.$$ 

Rearranging:

$$ S(n,k) = (n + 1)p\sum_{j = 0}^{k - 1}S(n, j)\binom{k - 1}{j} - p\sum_{j = 0}^{k - 1}S(n, j)\binom{k}{j}.$$

So, given a fixed $n$ we can suppress it in the notation, writing $S(n,k) \equiv S(k)$ and our equation becomes:

$$ S(k) = (n + 1)p\sum_{j = 0}^{k - 1}S(j)\binom{k - 1}{j} - p\sum_{j = 0}^{k - 1}S(j)\binom{k}{j}.$$

This is our sought after expression and it runs in $\mathcal{O}(k^{2})$. For a sanity check, we can plug in $k =1, 2$ into that expression and get $np$ and $np(np + 1 - p)$ respectively, as expected. 

<!-- Naturally, a follow-up question is whether we can do better than sub-quadratic—and the answer is yes. Depending on how far you’re willing to go down the rabbit hole, this can be made nearly linear. For a *slightly* faster approach, however, we can resort to the Fast Fourier Transform (FFT) to improve it to ~  $\mathcal{O}(k\log k)$. In particular, we make the following observations:

* $(n + 1)p\sum_{j = 0}^{k - 1}S(j)\binom{k - 1}{j} = (k-1)!(n + 1)p\sum_{j = 0}^{k - 1}\frac{S(j)}{j!}\frac{1}{(k - 1 - j)!}$. -->

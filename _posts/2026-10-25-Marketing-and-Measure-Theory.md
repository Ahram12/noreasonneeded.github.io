---
layout: post
title: "Difficulties and Strategies for Identifying Saturation Curves with Multi-Rate Decay"
date: 2026-10-25 10:00:00 -0700
categories: mathematics
---

### Introduction

A common interest among marketers is understanding the levels of spend at which investing in a particular media channel is useful. In other words, spending money on advertising is generally expected to be beneficial, but at some point we should also expect to see diminishing returns. Plots of spend levels against their associated incremental outcomes are often referred to as saturation curves.

While saturation curves are interesting in their own right, they are also useful for budget optimization/allocation (see, for example, [LightweightMMM](https://research.google/pubs/bayesian-methods-for-media-mix-modeling-with-carryover-and-shape-effects/)). For this reason, it is convenient to represent these curves parametrically in a form that is easy to work with. In practice, they are often assumed to belong to one of the following families:

* **Linear**: $f(x) = ax + b$, for $a, b \geq 0$

* **Negative Exponential**: $f(x) = a(1-e^{-bx})$, for $a, b \geq 0$

* **Hill**: $f(x) = \frac{ax^{n}}{k^{n} + x^{n}}$, for $a, k, n > 0$

* **Logistic**: $f(x) = \frac{1}{1 + e^{-a(x - b)}}$, for $a, b \geq 0$

These curves can be viewed through a broad dichotomy: those that exhibit an S shape (the Logistic family and the Hill family when $n > 1$), and those that are purely concave (the Negative Exponential family and the Hill family when $0 < n < 1$). in a more practical sense, the former class corresponds to functions that do not exhibit diminishing returns from their onsets while the latter class does.

Many open-source Media Mix Models (MMMs), including LightweightMMM, Meridian, and Robyn, produce saturation curves of these types. This motivated a recent exercise in which we asked whether we could fit models from the families above to appropriately normalized $(\text{spend}, \text{marginal return})$ pairs emitted by collections of models for a particular location–media-channel pair.

### What this Note Does

Fitting a single model from one of these families is a fairly standard exercise. A more interesting follow-up question is whether we can fit the data to countable (possibly infinite) sums of models from the same family. Marketers often have intuition about the shape of a particular channel's saturation curve and may assume that it belongs to one of the two broad classes described above. We will make the same assumption here: our mixture models will consist only of components from a single family. 

We characterize the concave and S shaped classes, provide via the ill-posedness of the Laplace transform why identifying functions from noisy data in the Concave case is difficult, and give more concrete modeling strategies as a follow up.

### Concave Saturation Curves

Let's first define the convex cone (since we are interested only in non-negative multiples) $C := \\{ g + \sum_{i \in S}f_{i} \\}$ where $g$ is a member of the Linear family, $S$ is countable set, and the $f_i$ are members of the Negative Exponential family. For now we ignore convergence requirements of the sums but we'll revisit this idea shortly. The key insight here is that members of $C$ bear a striking resemblance to the 
[Lévy-Khintchine Representation of Bernstein functions](https://en.wikipedia.org/wiki/Bernstein%27s_theorem_on_monotone_functions) that we state as a theorem: 

### Theorem 1 (Lévy-Khintchine Representation)
<div class="theorem"> 
A Bernstein function $f(t)$ is a non-negative function whose derivative is completely monotone (i.e., $f$ is smooth and satisfies $(-1)^{n - 1}\frac{d^{n}}{dt^{n}}f(t) \geq 0$ for all $n \geq 1$). Every Bernstein function has the following Lévy-Khintchine Representation:
$$ f(t) = c + dt + \int_{0}^{\infty}(1- e^{-tx})\mu(dx), $$
where $c, d \geq 0$ and $\mu$ is a positive Borel measure on the positive real half-line such that 
$$ \int _{0}^{\infty}\min(1,x)\mu(dx) < \infty $$. 

</div>

Note that the above implies that $\mu$ is a sigma-finite Radon measure. Define $\mathcal{B}$ to be the set of Bernstein functions. In our case, $C$ is precisely the case when $\mu$ is a atomic (countably supported) measure, i.e., $\mu = \sum_{i \in S}a_{i}\delta_{b_{i}} $. First, we prove a standard approximation result for finite Borel measures on compact sets:

### Lemma 1

<div class="lemma"> 
Suppose we have a finite Borel measure on a compact metric space $X$, then we can approximate it by atomic measures on X. Concretely, if $\mu$ is a finite Borel measure on a compact metric space $X$ there exists a sequence of distinct points $x_{k} \in X$ and positive weights $w_{k}$ such that

$$\sum_{k=1}^{N}w_{k}\delta_{x_k} \xrightarrow{weak^{*}} \mu $$
</div>

### Proof

<details>
  <summary>Click to expand proof</summary>

<div class="proof">

From the compactness of $X$, for any $\delta > 0$, $X$ can be covered by a finite collection of balls $B_{k}$ (we can without loss of generality assume they are disjoint) of radius $\frac{\delta}{2}$ centered at points $x_{k} \in X$ for $1 \leq k \leq N$. We also define $\mu_{\delta} = \sum_{k}\mu(B_{k})\delta_{x_{k}}$. From the Portmanteau theorem, proving weak * convergence is equivalent to showing that integrating any bounded (true for any continuous function on a compact set $X$), Lipschitz function $f$ against $\mu_{\delta}$ converges to integrating $f$ against $\mu$ as $\delta  \xrightarrow{} 0$. Let $\omega > 0$ denote the Lipschitz constant of $f$. Then we have 

$$ \left| \int f d\mu - \int f d\mu_{\delta} \right| \leq  \sum_{k}\int_{B_{k}}\left|f(x) - f(x_{k}) \right| d\mu \leq \omega \cdot \delta \cdot \mu(X) ,$$

which is seen to converge to $0$ as $\delta  \xrightarrow{} 0$.
</div>

</details>

Next, we show a density lemma that will let us make general statements about $C$:

### Lemma 2

<div class="lemma"> 
Let $X = (0, \infty)$ and consider the standard two point compactification of $X$, $X^{*}$, by adding the points $0$ and $\infty$. We claim the following:
 <ul>
    <li>Using the notation from Theorem 1, there is a bijection between the tuples $(c, d, \mu)$ (which uniquely defines a Bernstein function $f$) and finite measures $\kappa$ on $X^{*}$. </li>
    <li>If there is a sequence of finite measures $\kappa_{k} \xrightarrow{weak^{*}} \kappa$ then the corresponding $f_{k}$ and $f$ satisfy $f_{k}$ converges to $f$ pointwise. </li>
    <li>$C$ is dense in functions $f \in \mathcal{B}$ under pointwise convergence. </li>
    <li>Suppose $f_{k}, f \in \mathcal{B}$ and  $f_{k} \rightarrow f$ pointwise on $(0, \infty)$ then  $f_{k} \rightarrow f$ uniformly on every compact $[\alpha, \beta] \subset (0, \infty)$. </li>
  </ul>
</div>

### Proof

<details>
  <summary>Click to expand proof</summary>

<div class="proof">
<br>
We adopt the style from the work of Iyer, Leger, and Pego in their <a href="https://arxiv.org/abs/1610.04647">paper</a>, specifically Theorem A.6 in their Appendix. Further, fix $f \in \mathcal{B}$ so that by Theorem 1 there is a tuple $(c, d, \mu)$ so that 

$$f(t) = c + dt + \int_{0}^{\infty}(1- e^{-tx})\mu(dx)$$

and 

$$ \int _{0}^{\infty}\min(1,x)\mu(dx) < \infty.$$ 
Next, define 

$$\kappa \equiv d\delta_{0}(x) + c\delta_{\infty}(x) + \min(x,1)\mu(dx)$$

and observe that 
$$ \kappa(X^{*}) = \kappa([0, \infty]) = d + c + \int _{0}^{\infty}\min(1,x)\mu(dx) < \infty.$$

So, $\kappa$ is a finite measure on a compact set $X^{*}$. Continuing, define 

$$
g_{t}(x) = \begin{cases} 
  t & \text{if } x = 0 \\
  \frac{1- e^{-tx}}{\min(1,x)} & \text{if } x \in (0, \infty) \\
  1   & \text{if } x = \infty
\end{cases}
$$

and observe that $g_{t}$ is continuous at $x = 0$ and $x = \infty$ so $g_{t}$ is a continuous function on $X^{*}$. Integrating $g_{t}$ against $\kappa$ gives:

$$\langle g_{t}, \kappa \rangle = g_t(0) \cdot d + g_t(\infty) \cdot c + \int_{0}^{\infty}g_{t}(x)\min(x, 1)\mu(dx) = c + dt + \int_{0}^{\infty}(1- e^{-tx})\mu(dx).$$ So, every $f \in \mathcal{B}$ can be represented as a single pairing of a finite measure $\kappa$. Conversely, we go from $\kappa$ to a tuple $(c, d, \mu)$ by defining : 
$$d = \kappa(\{ 0 \}), c = \kappa(\{\infty\}), \mu(dx) = \frac{\kappa(dx)}{\min(x, 1)},$$
giving us our claimed bijection. 
<br>

<br>
By Lemma 1, since $X^{*}$ is compact, given a finite measure $\kappa$ on it, there exists a sequence of measures $\kappa_{k}$ that converge to it in the weak * sense. Using an identical argument as above gives that for any $t > 0$:
$$ f(t) = \langle g_{t}, \kappa \rangle = \lim_{k \xrightarrow{} \infty} \langle g_{t}, \kappa_{k} \rangle = \lim_{k \xrightarrow{} \infty}f_{k}(t).$$
So, weak * convergence implies pointwise convergence giving us our pointwise convergence.
<br>
<br>
Next, given any $f \in \mathcal{B}$, there is a corresponding $\kappa$, and a finite approximating sequence $\kappa_{k} = \kappa(\infty)\delta_{\infty} + \kappa(0)\delta_{0} + \sum_{k}w_{k}\delta_{x_{k}}$. Here, the $x_{k}$ are in the interval $(0, \infty)$ so our above inversion map gives $d = \kappa({0}), c = \kappa({\infty})$, and $\mu_{k} = \sum_{k}a_{k}\delta_{b_{k}}$ with $a_{i} = \frac{w_{k}}{\min(x, 1)}$ and $b_{i} = x_{k}$. Further, our delayed convergence requirements become exactly $\sum_{k}a_{k}\min(1, b_{k}) < \infty$ by the Levy condition. This gives the claimed approximation.
 <br>
 <br>
Finally, since $f$ is uniformly continuous on $[\alpha,\beta]$, choose a partition $\alpha=t_0<t_1<\dots<t_m=\beta$ with $f(t_j)-f(t_{j-1})<\varepsilon$ for every $j$. There are finitely many partition points, so pointwise convergence gives $K$ such that $|f_k(t_j)-f(t_j)|<\varepsilon$ for all $j$ and all $k\ge K$. Take $x\in[t_{j-1},t_j]$ and $k\ge K$. Monotonicity of $f_k$ gives the upper bound
$$f_k(x)\le f_k(t_j)<f(t_j)+\varepsilon<f(t_{j-1})+2\varepsilon\le f(x)+2\varepsilon,$$ and the lower bound
$$f_k(x)\ge f_k(t_{j-1})>f(t_{j-1})-\varepsilon>f(t_j)-2\varepsilon\ge f(x)-2\varepsilon.$$
Hence $\sup_{[\alpha,\beta]}|f_k-f|<2\varepsilon$ for all $k\ge K$.
 <br>
</div>

</details>
 <br>
From the above, we have that identifying functions in the concave case is actually about identifying Bernstein functions $f \in \mathcal{B}$. We can also add additional constraints of $f$:
* $f(0) = 0$

* $f$ has a finite aymptote at $\infty$

The first condition says we get no incremental return if we spend $0$ dollars and the second says that we have sub-linear growth at infinity, both reasonable assumptions. Together, these two say that that linear part of our approximation function vanishes and we are left only with sums of members of the Negative Exponential family.
<br>
<br>
Continuing, our problem now becomes identifying $\mu$ given our measurements pairs of spend data vs. returns.This however is known to be an ill-posed problem: up to a derivative, we are essentially asking if we can invert a Laplace transform using data only from the real-line, which although possible (the Post Widder Inversion Formula for example), numerical methods are well known to be ill-posed due to small perturbations in data leading to drastically different outcomes, see [here](https://www.sciencedirect.com/science/article/abs/pii/S0096300313003731) for example. Thus, because marketing data, even in cases with large variations in spend, are assuredly noisy, such exact methods are not promising. This gives a more precise explanation, in addition to marketer intuition, as to why identification of saturation curves is difficult. All hope is not lost however, instead we turn this into an estimation problem, which we discuss at the end of this note.
 <br>

### S-Shaped Saturation Curves

We will first observe that the members of this family can both be described conveniently in terms of the sigmoid function $\sigma(x) = \frac{1}{1 + e^{-x}}$: 

* **Hill**: $f(x) = \frac{ax^{n}}{k^{n} + x^{n}}$, for $a, k > 0 n > 1$, so, $f(x) = a \cdot \sigma(n(\log x - \log k))$ 

* **Logistic**: $f(x) = \frac{1}{1 + e^{-a(x - b)}}$, for $a, b \geq 0$, so, $f(x) = \sigma(-a(x - b))$ 

In this way we want to consider again consider the set of countable sums $\mathcal{D} = \\{ \sum_{i \in S}f_{i} \\}$ where $f_{i} = a_{i} \sigma(b_{i}( x - c_{i}))$ for some $a_{i}, b_{i}, c_{i}$ non-negative for some countable set $S$. We will show that $\mathcal{D}$ is dense in the space of continuous, monotonic functions, $C^{*}, (K)$ for any compact set $K$ under the sup norm.

### Lemma 3

<div class="lemma"> 
For any compact interval $K \subset [0, \infty)$ we can approximate elements of $C^{*}(K)$ uniformly by sums of constants and elements of $\mathcal{D}$.
</div>

### Proof

<details>
  <summary>Click to expand proof</summary>

<div class="proof">
<br>
Choose $f \in C^{*}(K)$ and let $K = [\alpha,\beta]$ for some $\alpha, \beta \in \mathbb{R}$. Fix $\epsilon > 0$ and choose $\delta > 0$ such that $\left| f(x) - f(y) \right| < \epsilon$ if $\left| x - y \right| < \delta$. Define a partition $P_{\delta} = \{p_{0} = \alpha, p_{1}, ...,p_{N-1} = \beta\}$ of $K$ such that the difference between any successive $p_{i}$ is equal to $ h <\delta$. Define
$$g(x) = \sum_{j = 0}^{N - 1}c_{j}\mathbb{1}_{\{x \geq p_{j}\}} + f(\alpha),$$
where $c_{j} = f(p_{j}) - f(p_{j - 1})$. Observe that $g$ is monotonically increasing and if $x_{0} \in [p_{s - 1}, p_{s})$ then $G(x_{0}) = f(p_{s - 1})$. Hence,
$$\sup_{x \in K} \left| f - g\right| < \epsilon.$$
 <br>
 <br>
Next, define $G(x) = \sum_{j = 1}^{N - 1}c_{j}\sigma(w(x - p_{j})) + f(\alpha)$ for $w \in \mathbb{R}$ and observe that the inequality
$$\left|\mathbb{1}_{\{x \geq 0\}} - \sigma(x) \right| \leq e^{-\left| x \right|}$$
implies that 
$$\left| g(x) - G(x) \right| \leq \sum_{j}c_{j}e^{-\left| w(x - p_{j}) \right|} .$$
Fix $x_{0} \in [p_{s - 1}, p_{s})$ and observe that if we sum the contribution from every $j \neq s - 1, s$ in the sum it is at most $(f(\beta) - f(\alpha))e^{-wh}$ and the terms $j = s - 1, s$ contribute at most $2\epsilon$ together. So altogether, 
$$\sup_{x \in K} \left| f - G \right| < \epsilon + 2\epsilon + (f(\beta) - f(\alpha))e^{-wh} = 3\epsilon + (f(\beta) - f(\alpha))e^{-wh}.$$
If we choose $w > \frac{1}{h}\log(\frac{f(\beta) - f(\alpha)}{\epsilon})$, the overall supremum is $O(\epsilon)$ and the result follows. 
 <br>
</div>

</details>

Unlike the concave case, given a function we want to approximate, we have a constructive regression strategy (no need to identify atoms as in the concave case) to generate estimating functions. We also observe that the result here holds for the Hill transform on compact sets away from the origin (our log transformation makes that undefined). On the other hand, if we let $f$ be a function that is the limit of the sum of the Hill functions (assuming convergence) that $f(0) = f'(0) = 0$. So, in that sense we see that the Hill case has some rigid structure at the origin but is flexible elsewhere. In a similar vein to the concave case, it again makes sense for practitioners to assume that 
* $f(0) = 0$

* $f$ has a finite aymptote at $\infty$

So, in the Hill case we get this for free and in the pure logistic case, this means that we can get arbitrarily to the origin but never reach it. 
### Modeling Strategies

In this section we discuss two possible strategies for estimating them in the Concave case.

Strategy 1: Non-Negative Least Squares

We discretize the problem by selecting a log spaced grid $B$ of points $(b_{1}, b_{2},..,b_{N})$, where the $N$ (say $N \text{~} 200$) points are chosen from a plausible range for a specific marketing channel. These $N$ points are in fact the atomic approximation from Lemma 2. If we let our regression pairs be $(x_{i}, y_{i})$ where the $x_{i}$ are spend levels and the $y_{i}$ are estimated levels of incremental outcomes, we can form a design matrix $X_{ij} = 1 - e^{-x_{i}b_{j}}$. If we let $Y$ denote the vector of our $y_{i}$ and $a$ denote the matrix corresponding to our $a_{j} \geq 0$ (recall our summands are of the form $a_{j}(1 - e^{-b_{j}x})$ ) we have the problem:

$$ \arg\min_{a \in \mathbb{R}^{N}_{\geq 0}}\Vert{}Y - Xa\Vert{}_2^2, $$

in other words, non-negative least squares. Many libraries exist to solve such problems (for example CVXPY and Scipy in Python). 

Strategy 2: Tikhonov Regularization

Consider:

$$F(s) = \int_{0}^{\infty}(1 - e^{-st})f(t)dt,$$

and instead of trying to invert this relationship directly we again discretize by say taking a log-spaced grid of values for $t$ on $(0, \infty)$ to write the integral as a sum approximation of the values at $e^{-st}f(t)$ and call this operator evaluated at our grid $A$ and consider instead the minimization problem

$$ \min_{f}\Vert{}Af - y\Vert{}_2^2 + \alpha\Vert{}Lf\Vert{}_2^2, $$  

where $\alpha > 0$ is our regularization parameter and $L$ is a penalty operator (say a second derivative estimated with finite differences) to enforce smoothness (think about a spline penalty for example). Tikhonov Regularization can be thought of as the smoothing alternative to Non-Negative Least Squares (a reasonable first approach).

### Takeaways

1. The concave case is rigid, but hard to identify.
<br>
As we have seen, the closure of the concave case is the Bernstein functions, so this class has a precise, characterizable shape. The price to pay for this structure however, is the necessity of recovering the underlying measure $\mu$ from noisy data: we are combining an ill-posed inverse problem (Laplace inversion from non-negative real-line data) in a bounded spend interval. 
<br>
2. The S-shape case is flexible but allows for more concrete identification.
<br>
The closure of the functions we looked at here take on a much brader class, continuous monotone functions, however we have constructive strategy to create approximates on the desired amount of accuracy. That being said, the S-shape is generally not preserved: this approach recovers a monotonic curve and not necessarily meaningful aspects of it. Hence, the the Concave and S-shape cases ultimately differ in how shape they impose and not the ability to recover meaningful information about them. 
<br>
3. Trust curves more than individual components. 
<br>
In the concave case different choices of pairs $(a_{i}, b_{i})$ can produce similar curves over the observed spend range. This means that is unwise to focus too much on individual parameters and instead on fitted curves and derived quantities such as marginal returns. Individual decay rates can be noisy and claimed precision for any media channel warrants skepticism.
<br>
4. Practical starting points.
<br>
In the Concave case, starting with a small grid of candidate rates and solving Non-Negative Least Squares (this is a convex problem and tends to return sparse solutions via conditions such as the KKT conditions) is a good place to start. If insufficient, Tikhonov regularization offers a smoothing alternative. In both cases, check results for stability (is the design matrix degenerate or do small perturbations in data lead to large changes in curves?) before drawing conclusions.
<br>
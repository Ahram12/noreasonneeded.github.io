---
layout: post
title: "Identification and Regression of Saturation Curves with Multi-Rate Decay"
date: 2026-09-23 10:00:00 -0700
categories: mathematics
---

### Introduction

A common interest among marketers is understanding the levels of spend at which investing in a particular media channel is useful. In other words, spending money on advertising is generally expected to be beneficial, but at some point we should also expect to see diminishing returns. Plots of spend levels against their associated marginal returns are often referred to as saturation curves.

While saturation curves are interesting in their own right, they are also useful for budget optimization/allocation (see, for example, [LightweightMMM](https://research.google/pubs/bayesian-methods-for-media-mix-modeling-with-carryover-and-shape-effects/)). For this reason, it is convenient to represent these curves parametrically in a form that is easy to work with. In practice, they are often assumed to belong to one of the following families:

* **Linear**  $f(x) = ax + b$, for $a\geq 0$

* **Negative Exponential**: $f(x) = a(1-e^{-bx})$, for $a, b \geq 0$

* **Hill**: $f(x) = \frac{ax^{n}}{k^{n} + x^{n}}$, for $a, k, n > 0$

* **Logistic**: $f(x) = \frac{1}{1 + e^{-ax - b}}$, for $a, b \geq 0$

These curves can be viewed through a broad dichotomy: those that exhibit an S shape (the Logistic family and the Hill family when $n > 1$), and those that are purely concave (the Linear family and the Negative Exponential family and the Hill family when $0 < n < 1$).

Many open-source Media Mix Models (MMMs), including LightweightMMM, Meridian, and Robyn, produce saturation curves of these types. This motivated a recent exercise in which we asked whether we could fit models from the families above to appropriately normalized $(\text{spend}, \text{marginal return})$ pairs emitted by collections of models for a particular location–media-channel pair.

### What this Note Does

Fitting a single model from one of these families is a fairly standard exercise. A more interesting follow-up question is whether we can fit the data to countable (possibly infinite) sums of models from the same family (allowing for more robust estimation). Marketers often have intuition about the shape of a particular channel's saturation curve and may assume that it belongs to one of the two broad classes described above. We will make the same assumption here: our mixture models will consist only of components from a single family. 

Furthermore, we will give a rigorous mathematical description of why this is a difficult/interesting problem and cover concrete modeling approaches. 

We'll cover the two cases separately.

### Concave Saturation Curves

Let's first define the convex cone (since we are interested only in non-negative multiples) $C := \\{ \sum_{i \in S}f_{i} \\}$ where $S$ is countable set and the $f_i$ are members of the Negative Exponential family. For now we ignore convergence requirements of the sums but we'll revisit this idea shortly. The key insight here is that members of $C$ bear a striking resemblance to the 
[Lévy-Khintchine Representation of Bernstein functions](https://en.wikipedia.org/wiki/Bernstein%27s_theorem_on_monotone_functions) that we state as a theorem: 

### Theorem 1 (Lévy-Khintchine Representation)
<div class="theorem"> 
A Bernstein function $f(t)$ is a non-negative completely monotone function (i.e., $f$ is smooth and satisfies $(-1)^{n}\frac{d^{n}}{dt^{n}}f(t) \geq 0$ for all $n \geq 0$). Every Bernstein function has the following Lévy-Khintchine Representation:
$$ f(t) = c + dt + \int_{0}^{\infty}(1- e^{tx})\mu(dx), $$
where $c, d \geq 0$ and $\mu$ is a positive Borel measure on the positive real half-line such that 
$$ \int _{0}^{\infty}\min(1,x)\mu(dx) < \infty $$. 

</div>

Note that the above implies that $\mu$ is a sigma-finite Radon measure. Define $\mathcal{B}$ to be the set of Bernstein functions. In our case, $C$ is precisely the case when $\mu$ is a finitely supported measure, i.e., $\mu = \sum_{i \in S}a_{i}\delta_{b_{i}} $. First, we prove a standard approximation result for finte Borel measures on compact sets:

### Lemma 1

<div class="lemma"> 
Suppose we have a finite Borel measure on a compact Euclidean set $X$, then we can approximate it by atomic measures on X. Concretely, if $\mu$ is a finite Borel measure on a compact Euclidean set $X$ there exists a sequence of not necessarily distinct points $x_{i}$ such that

$$\frac{1}{n}\sum_{i=1}^{n}\delta_{x_i} \xrightarrow{weak^{*}} \mu $$
</div>

### Proof

<details>
  <summary>Click to expand proof</summary>

<div class="proof">

We give a constructive proof of this result. Without loss of generality assume that $\mu$ is a probability measure otherwise we can just re-scale. In this case fix $n \in \mathbb{N}_{>0}$ and denote $y_{k} = \frac{k}{n}$ for $0 \leq k \leq n$ and $I_{k} = [y_{k - 1}, y_{k})$ for $1 \leq k \le n$ and $I_{n} = [y_{n - 1}, y_{n}]$. Next, define $F_{\mu}$ to be the cdf of $\mu$ and define $Z_{k} = F^{-1}_{\mu}(I_{k})$ (here this of course the generalized inverse) for $1 \leq k \leq n$ where in particular $z_{0} = -\infty$, $z_{n} = \infty$ and $Z_{k} = [z_{k - 1}, z_{k}]$. From this description, it is clear that the $Z_{k}$ are a partition of $\mathbb{R}$. Next, define 
$$ \mu_{n} = \frac{1}{n - 1}\sum_{k= 1}^{n - 1}\delta_{z_{k}} $$ 

and 

$$F_{\mu_{n}} = \frac{n}{n - 1}\sum_{k = 1}^{n - 1}y_{k} \cdot \chi_{Z_{k + 1}} .$$

Setting $S = (-\infty, t)$ for any $t \in \mathbb{R}$  we can verify directly that 

$$\int_{S}d\mu_{n} = F_{\mu_{n}}(t), $$

so, $F_{\mu_{n}}$ is the cdf of $\mu_{n}$. Finally, again via direct computation we can verify that 

$$ \lvert F_{\mu_{n}}(t) - F_{\mu}(t) \rvert \leq \frac{1}{n}, $$

so, $\mu_{n}$ converges to $\mu$ in distribution and by the Portmanteau theorem in the 

weak * sense as well. 
</div>

</details>

Next, we show a density lemma that will let us make general statements about $C$:

### Lemma 2

<div class="lemma"> 
We have the following:
 <ul>
    <li>There is a topology $\tau$ on $X^{*} = [0, \infty]$ and a corresponding Borel measure $\kappa$ on $X^{*}$ such that $\kappa(X^{*}) < \infty$.</li>
    <li>Under the above topology $\tau$, $\bar{C} = \mathcal{B}$, in other words $C$ is dense in $\mathcal{B}$.</li>
  </ul>
</div>

### Proof

<details>
  <summary>Click to expand proof</summary>

<div class="proof">
We adopt the style from the work of Iyer, Leger, and Pego in their <a href="https://arxiv.org/abs/1610.04647">paper</a>, specifically Theorem A.6 in their Appendix. Define $X = (0, \infty)$ and consider the standard two point compactification of $X$, $X^{*}$ by adding the points $0$ and $\infty$. Further, fix $f \in \mathcal{B}$ so that by Theorem 1 there is a tuple $(c, d, \mu)$ so that 

$$f(t) = c + dt + \int_{0}^{\infty}(1- e^{tx})\mu(dx)$$

and 

$$ \int _{0}^{\infty}\min(1,x)\mu(dx) < \infty.$$ 
Next, define 

$$\kappa \equiv d\delta_{0}(x) + c\delta_{\infty}(x) + \min(x,1)\mu(dx)$$

and observe that 
$$ \kappa(X^{*}) = \kappa([0, \infty]) = d + c + \int _{0}^{\infty}\min(1,x)\mu(dx) < \infty.$$

So, $\kappa$ is a finte measure on a compact set $X^{*}$. Continuing, define 

$$
g_{t}(x) = \begin{cases} 
  t & \text{if } x = 0 \\
  \frac{1- e^{tx}}{\min(1,x)} & \text{if } x \in (0, \infty) \\
  1   & \text{if } x = \infty
\end{cases}
$$

and observe that $g_{t}$ is continuous at $t = 0$ and $t = \infty$ so $g_{t}$ is a continuous function on $X^{*}$. Integrating $g_{t}$ against $\kappa$ gives:

$$\langle g_{t}, \kappa \rangle = g_t(0) \cdot d + g_t(\infty) \cdot c + \int_{0}^{\infty}g_{t}(x)\min(x, 1)\mu(dx) = c + dt + \int_{0}^{\infty}(1- e^{tx})\mu(dx).$$ So, every $f \in \mathcal{B}$ can be represented as a single pairing of a finite measure $\kappa$ (independent of $t$) on a compact space against a continuous function $g_{t}$. So, by Lemma 1, every finite measure $\kappa$ on the compact space $X^{*}$ can be approximated by a sum of fitely supported atomic measures. Hence, $C$ is dense in $\mathcal{B}$  in the two point compactification topology, as claimed. 
</div>

</details>

From the above, we have that identifying functions in the concave case is actually about identifying Bernstein functions $f \in \mathcal{B}$. From this standpoint, our problem now becomes identifying $\mu$ given our measurements pairs of spend data vs. returns. This however is known to be an ill-posed problem: up to a derivative, we are essentially asking if we can invert a Laplace transform using data only from the real-line, which although possible (the Post Widder Inversion Formula for example), numerical methods are well known to be ill-posed due to small perturbations in data leading to drastically different outcomes, see [here](https://www.sciencedirect.com/science/article/abs/pii/S0096300313003731) for example. Thus, because marketing data, even in cases with large variations in spend, are assuredly noisy, such exact methods are not promising. This gives a rigorous explanation, in addition to marketer intuition, as to why identification of saturation curves is difficult. All hope is not lost howver, instead we turn this into an estimation problem, which we discuss at the end of this note.

### S-Shaped Saturation Curves

We will first observe that the members of this family can both be described conveniently in terms of the sigmoid function $\sigma(x) = \frac{1}{1 + e^{-x}}$: 

* **Hill**: $f(x) = \frac{ax^{n}}{k^{n} + x^{n}}$, for $a, k, n > 1$, so, $f(x) = a \cdot \sigma(n(\log x - \log k))$ 

* **Logistic**: $f(x) = \frac{1}{1 + e^{-ax - b}}$, for $a, b \geq 0$, so, $f(x) = \sigma(ax + b)$ 

In this way we want to consider again consider the set of countable sums $\mathcal{D} = \\{ \sum_{i \in S}f_{i} \\}$ where $f_{i} = a_{i} \sigma(b_{i} x + c_{i})$ for some $a_{i}, b_{i}, c_{i} \in \mathbb{R}$. These sums have a well known discription and are the basis of the universality of neural networks, in particular, Lensho, Lin, Pinkus, and Schocken showed in [Multilayer Feedforward Networks with a Non-Polynomial Activation Function can Approximate any Function](https://archive.nyu.edu/bitstream/2451/14329/1/IS-92-13.pdf) that for any compact $K \subset \mathbb{R}$ such functions are dense in the continuous functions on $K$, i.e. $C(K)$, under the familiar sup norm. We will avoid posting the whole argmuent here for brevity's sake but instead we list the key steps with some additional details that the interested reader can fill in for themselves:

* Step 1: Consider the set $\mathcal{D} = \\{ \sum_{i \in S}f_{i} \\}$ where $f_{i} = a_{i} \sigma(b_{i} x + c_{i})$ for some $a_{i}, b_{i}, c_{i} \in \mathbb{R}$ and $\sigma$ is more generally any continuous non-polynomial function. Our goal is to show that $D$ is dense in $C(K)$ under the sup norm. To this end, suppose by contradiction that it is not, so that there is at least one $g \in C(K)$ not in the linear span of the linear shifts of $\sigma$. 

* Step 2: By the Hahn-Banach Theorem applied to the linear subspace 
$$ D^{*} = \{ d + \lambda g\ |\ d \in D, \lambda \in \mathbb{R} \} $$ of $C(K)$
we have that there is a bounded linear functional $F$ such that $F$ is non-identically $0$ on $C(K)$ but $0$ on $D$.

* Step 3: By the Riesz–Markov–Kakutani representation theorem this implies that there exists a unique signed Radon measure $\mu$ such that

$$F(f) = \int_{K}fd\mu \ \text{for all}  \ f \in C(K) .$$

* Step 4: So, in particular we have that $\int_{K}\sigma(b x + c)d\mu(x) = 0  \ \text{for all} \ b, c \in \mathbb{R}$. Fix $b$, take $c = 0$, and assume without loss of generality that $\sigma$ is analytic about $0$, otherwise we can mollify with a Gaussian/Heat kernel, so that for $\left\vert x  \right\vert$ sufficiently small we can write

$$\sigma(b x) = \sum_{j = 0}^{\infty}\frac{\sigma^{(j)}(0)}{j!}(b x)^{j}.$$

* Step 5: Define $M_{j} = \int_{K}x^{j}d\mu(x) < \infty$ to be the $j$-th moment of $\mu$. So, by the uniquness of Taylor series, we have that $\sigma^{(j)}(0) \cdot M_{j} = 0 $ for all $j \geq 0 $. Now, since $\sigma$ is not a polynomial it must be the case that $\sigma^{(j)}(0) \neq 0$ for infinitely many $j$ and for these $M_{j} = 0$. On the other hand, for the remaining moments $M_{l}$ that we cannot conclude are $0$ this way, we can differentiate $r$ times through the integral, and repeating our Taylor series arument for $\sigma^{(r)}$ where $r$ is sufficiently large so that $\sigma^{(r + l)}(0) \neq 0$ and thus $M_{l} = 0$. With this, we can conclude that $M_{i} = 0$ for all $i \geq 0$.

* Step 6: Consider the moment generating function of $\mu$, extended to all complex numbers $z$, $G(z) = \int_{K}e^{xz}d\mu(x)$. The compactness of $K$ implies that it is an entire function and the above moments calculation implies that $G$ is $0$. In particular substituting $z = it$, Fourier uniqueness implies that $\mu$ is identically $0$, contradicting our earlier construction from Hahn-Banach. Therefore $D$ was dense in $C(K)$ as claimed. 

This is an interesesting result because it unlike our concave case, the the above argument shows that the sigmoid class is robust enough to actually represent any continuous function on any compact subset of the real line and we don't get a nice restrictive group of functions.

### Modeling Strategies

So far we have discussed the difficulties of identifying the limiting functions of countable sums of diminishing curve functions, however, in this section we discuss two possible strategies for estimating them in the Concave case.

Strategy 1: Tikhonov Regularization

We will not go into detail about this method but here we can again more generally think about the concept of inverting a Laplace Transform. In particular, consider:

$$F(s) = \int_{0}^{\infty}e^{-st}f(t)dt,$$

and instead of trying to invert this relationship directly we discretize the Laplace Transform by say taking a log-spaced grid of values for $s$ on $(0, \infty)$ to write the integral as a sum approximation of the values at $e^{-st}f(t)$ and call this operator evaluated at our grid $A$ and consider instead the minimzation problem

$$ \min_{f}\Vert{}Af - y\Vert{}_2^2 + \alpha\Vert{}Lf\Vert{}_2^2, $$  

where $\alpha > 0$ is our regularization parmeter and $L$ is a penalty operator (say a second derivative estimated with finite differences) to enforce smoothness (think about a spline penalty for example).

Strategy 2: Non-Negative Least Squares

Similar to the above, we discretize the problem by selecting a log spaced grid $B$ of plausible points $(b_{1}, b_{2},..,b_{N})$, where the $N$ points are chosen from a plausible range for a specific marketing channel. We can then construct Then, if we let our regression pairs be $(x_{i}, y_{i})$ where the $x_{i}$ are spend levels and the $y_{i}$ are estimated levels of incremental outcomes, we can form a design matrix $X_{ij} = 1 - e^{-x_{i}b_{j}}$. If we let $Y$ denote the vector of our $y_{i}$ and $A$ denote the matrix corresponding to our $a_{j} \geq 0$ (recall our summands are of the form $a_{j}(1 - e^{-b_{j}x})$ ) we have thr problem:
 
$$ \arg\min_{A, B}\Vert{}Y - AX\Vert{}_2^2, $$

in other words, non-negative least squares. Many libraries exist to solve such problems (for example CVXPY and Scipy in Python). 


### Takeaways

We have talked through robust estimation. 
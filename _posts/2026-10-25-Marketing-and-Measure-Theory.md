---
layout: post
title: "Saturation Curves with Multi-Rate Decay"
date: 2026-10-25 10:00:00 -0700
categories: mathematics
description: "Characterising the concave and S-shaped saturation curves as mixtures, why the ill-posedness of Laplace inversion makes the concave case hard to identify from noisy data, and what to do about it when modelling."
---

## Contents
{: .no_toc}

* TOC
{:toc}

## 1. Introduction {#introduction}

A common interest among marketers is understanding the levels of spend at which investing in a particular media channel is useful. In other words, spending money on advertising is generally expected to be beneficial, but at some point we should also expect to see diminishing returns. Plots of spend levels against their associated incremental outcomes are often referred to as saturation curves.

While saturation curves are interesting in their own right, they are also useful for budget optimization/allocation (see, for example, LightweightMMM<sup id="cite-1"><a href="#ref-1">1</a></sup>). For this reason, it is convenient to represent these curves parametrically in a form that is easy to work with. In practice, they are often assumed to belong to one of the following families:

* **Linear**: $f(x) = ax + b$, for $a, b \geq 0$

* **Negative Exponential**: $f(x) = a(1-e^{-bx})$, for $a, b \geq 0$

* **Hill**: $f(x) = \frac{ax^{n}}{k^{n} + x^{n}}$, for $a \geq 0, k > 0, n > 1$

* **Logistic**: $f(x) = \frac{1}{1 + e^{-a(x - b)}}$, for $a, b \geq 0$

These curves can be viewed through a broad dichotomy: those that exhibit an S shape (the Logistic family and the Hill family when $n > 1$), and those that are purely concave (the Negative Exponential family and the Linear family). In a more practical sense, the former class corresponds to functions that do not exhibit diminishing returns from their onsets while the latter class does.

Many open-source Media Mix Models (MMMs), including LightweightMMM<sup id="cite-1b"><a href="#ref-1">1</a></sup>, Meridian<sup id="cite-2"><a href="#ref-2">2</a></sup>, and Robyn<sup id="cite-3"><a href="#ref-3">3</a></sup>, produce saturation curves of these types. This motivated a recent exercise in which we asked whether we could fit models from the families above to appropriately normalized $(\text{spend}, \text{incremental outcome})$ pairs emitted by collections of models for a particular location–media-channel pair.

### What this note does {#what-this-note-does}

Fitting a single model from one of these families is a fairly standard exercise. A more interesting follow-up question is whether we can fit the data to countable (possibly infinite) sums of models from the same family. Marketers often have intuition about the shape of a particular channel's saturation curve and may assume that it belongs to one of the two broad classes described above. We will make the same assumption here: our mixture models will consist only of components from a single family. 

We characterize the Concave and S-shaped classes, explain via the ill-posedness of Laplace inversion why identifying functions from noisy data in the Concave case is difficult, and close with concrete modeling strategies.

### Who this note is for {#who-this-note-is-for}

This note is intended for a quantitatively aware audience interested in applied modeling in Marketing. The theory section assumes familiarity with measure theory and analysis. It can be skipped: Applied modeling gives a concrete saturation-curve regression example, and Takeaways summarizes the post.

## 2. Theory {#theory}

### 2.1 Concave saturation curves {#concave}

Let's first define the convex cone (since we are interested only in non-negative multiples) $C := \\{ g + \sum_{i \in S}f_{i} \\}$ where $g$ is a member of the Linear family, $S$ is a countable set, and the $f_i$ are members of the Negative Exponential family. For now we ignore convergence requirements of the sums but we'll revisit this idea shortly. The key insight here is that members of $C$ bear a striking resemblance to the 
Lévy-Khintchine Representation of Bernstein functions<sup id="cite-4"><a href="#ref-4">4</a></sup> that we state as a theorem: 

#### Theorem 1 (Lévy-Khintchine Representation)
{: .no_toc}

<div class="theorem"> 
A Bernstein function $f(t)$ is a non-negative function whose derivative is completely monotone (i.e., $f$ is smooth and satisfies $(-1)^{n - 1}\frac{d^{n}}{dt^{n}}f(t) \geq 0$ for all $n \geq 1$). Every Bernstein function has the following Lévy-Khintchine Representation:
$$ f(t) = c + dt + \int_{0}^{\infty}(1- e^{-tx})\mu(dx), $$
where $c, d \geq 0$ and $\mu$ is a positive Borel measure on the positive real half-line such that 
$$ \int _{0}^{\infty}\min(1,x)\mu(dx) < \infty.$$ 
The converse is true as well, that is, if any function is of this form it's a Bernstein function too. 
</div>

Note that the above implies that $\mu$ is a sigma-finite Radon measure. Define $\mathcal{B}$ to be the set of Bernstein functions. In our case, $C$ is precisely the case when $\mu$ is an atomic (countably supported) measure, i.e., $\mu = \sum_{i \in S}a_{i}\delta_{b_{i}} $. First, we prove a standard approximation result for finite Borel measures on compact sets:

#### Lemma 1
{: .no_toc}

<div class="lemma"> 
Suppose we have a finite Borel measure on a compact metric space $X$, then we can approximate it by atomic measures on X. Concretely, if $\mu$ is a finite Borel measure on a compact metric space $X$ there exists a sequence of distinct points $x^{m}_{k} \in X$ and positive weights $w^{m}_{k}$ such that

$$\mu_{m} = \sum_{k=1}^{N_{m}}w^{m}_{k}\delta_{x^{m}_k} \xrightarrow{*} \mu, $$
as $m \rightarrow \infty$.
</div>

<details>
  <summary>Click to expand proof</summary>

<div class="proof">

From the compactness of $X$, for any $m > 0$, $X$ can be covered by a finite collection of disjoint sets $B_{k}$ of diameter less than $\delta = \frac{1}{m}$ containing points $x^{m}_{k} \in X$ for $1 \leq k \leq N_{m}$. We also define $\mu_{m} = \sum_{k}\mu(B_{k})\delta_{x^{m}_{k}}$. By the Portmanteau theorem it suffices to test against bounded Lipschitz functions — and on a compact $X$ every continuous function is bounded. Let $\omega > 0$ denote the Lipschitz constant of $f$. Then we have 

$$ \left| \int f d\mu - \int f d\mu_{m} \right| \leq  \sum_{k}\int_{B_{k}}\left|f(x) - f(x_{k}) \right| d\mu \leq \omega \cdot \delta \cdot \mu(X) ,$$

which is seen to converge to $0$ as $m  \xrightarrow{} \infty$.
</div>

</details>

Next, we show a density lemma that will let us make general statements about $C$:

#### Lemma 2
{: .no_toc}

<div class="lemma"> 
Let $X = (0, \infty)$ and consider the standard two point compactification of $X$, $X^{*}$, by adding the points $0$ and $\infty$. We claim the following:
 <ul>
    <li>Using the notation from Theorem 1, there is a bijection between the tuples $(c, d, \mu)$ (which uniquely defines a Bernstein function $f$) and finite measures $\kappa$ on $X^{*}$. </li>
    <li>If there is a sequence of finite measures $\kappa_{m} \xrightarrow{*} \kappa$ then the corresponding $f_{m}$ and $f$ satisfy $f_{m}$ converges to $f$ pointwise. </li>
    <li>$C$ is dense in functions $f \in \mathcal{B}$ under pointwise convergence. </li>
    <li>Suppose $f_{m}, f \in \mathcal{B}$ and  $f_{m} \rightarrow f$ pointwise on $(0, \infty)$ then  $f_{m} \rightarrow f$ uniformly on every compact $[\alpha, \beta] \subset (0, \infty)$. </li>
  </ul>
</div>

<details>
  <summary>Click to expand proof</summary>

<div class="proof">
<br>
We adopt the style from the work of Iyer, Leger, and Pego<sup id="cite-5"><a href="#ref-5">5</a></sup>, specifically Theorem A.6 in their Appendix. Further, fix $f \in \mathcal{B}$ so that by Theorem 1 there is a tuple $(c, d, \mu)$ so that 

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
By Lemma 1, since $X^{*}$ is compact, given a finite measure $\kappa$ on it, there exists a sequence of measures $\kappa_{m}$ that converge to it in the weak * sense. Using an identical argument as above gives that for any $t > 0$:
$$ f(t) = \langle g_{t}, \kappa \rangle = \lim_{m \xrightarrow{} \infty} \langle g_{t}, \kappa_{m} \rangle = \lim_{m \xrightarrow{} \infty}f_{m}(t).$$
So, weak * convergence implies pointwise convergence giving us our pointwise convergence.
<br>
<br>
Next, given any $f \in \mathcal{B}$, there is a corresponding $\kappa$, and a finite approximating sequence $\kappa_{m} = \kappa(\{ \infty \})\delta_{\infty} + \kappa(\{ 0 \})\delta_{0} + \sum_{k}w^{m}_{k}\delta_{x^{m}_{k}}$. Here, the $x^{m}_{k}$ are in the interval $(0, \infty)$ so our above inversion map gives $d = \kappa(\{ 0 \}), c = \kappa(\{ \infty \})$, and $\mu_{m} = \sum_{k}a^{m}_{k}\delta_{b^{m}_{k}}$ with $a^{m}_{k} = \frac{w^{m}_{k}}{\min(x^{m}_{k}, 1)}$ and $b^{m}_{k} = x^{m}_{k}$. Further, our deferred convergence requirements become exactly $\sum_{k}a^{m}_{k}\min(1, b^{m}_{k}) < \infty$ by the Lévy condition. This gives the claimed approximation.
 <br>
 <br>
Finally, since $f$ is uniformly continuous on $[\alpha,\beta]$, choose a partition $\alpha=p_0<p_1<\dots<p_m=\beta$ with $f(p_j)-f(p_{j-1})<\varepsilon$ for every $j$. There are finitely many partition points, so pointwise convergence gives $K$ such that $|f_k(p_j)-f(p_j)|<\varepsilon$ for all $j$ and all $k\ge K$. Take $x\in[p_{j-1},p_j]$ and $k\ge K$. Monotonicity of $f_k$ gives the upper bound
$$f_k(x)\le f_k(p_j)<f(p_j)+\varepsilon<f(p_{j-1})+2\varepsilon\le f(x)+2\varepsilon,$$ and the lower bound
$$f_k(x)\ge f_k(p_{j-1})>f(p_{j-1})-\varepsilon>f(p_j)-2\varepsilon\ge f(x)-2\varepsilon.$$
Hence $\sup_{[\alpha,\beta]}|f_k-f|<2\varepsilon$ for all $k\ge K$.
 <br>
</div>

</details>
 <br>
So, from the above, we can conclude that identifying functions in the Concave case is actually about identifying Bernstein functions $f \in \mathcal{B}$. Continuing, we can also add additional constraints on $f$ that reflect our beliefs about it in practice:
* $f(0) = 0$

* $f$ has a finite asymptote at $\infty$

The first condition says we get no incremental return if we spend $0$ dollars and the second says that we have bounded growth at infinity, both reasonable assumptions. Together, these two say that the linear part of our approximation function vanishes (Dominated Convergence for example) and we are left only with sums of members of the Negative Exponential family. Moreover we can see that our two assumptions imply that $\mu$ is actually a finite measure. Indeed, we have that 

$$f(\infty) = \lim_{t \rightarrow \infty}f(t) = \mu((0, \infty)).$$

If we let $A$ denote this common value then 

$$ A - f(t) = \int_{0}^{\infty}e^{-tx}\mu(dx) $$ 

$$\frac{f(t)}{A} = 1 - \mathop{\mathbb{E}}(e^{-tB}), \ \ B \sim \frac{\mu}{A}.$$

So, we can think of our Concave case as mixtures of exponential distributions whose rates are draws from our re-scaled measure $\mu$ and whose curve is the expectation. Putting our observations together, our problem now becomes identifying $\mu$ given our measurements pairs of spend data vs. returns. This however is known to be an ill-posed problem: up to scaling, we are essentially asking if we can invert a Laplace transform using data only from the real-line, which although possible (the Post-Widder Inversion Formula<sup id="cite-6"><a href="#ref-6">6</a></sup> for example), numerical methods are well known to be ill-posed due to small perturbations in data leading to drastically different outcomes<sup id="cite-7"><a href="#ref-7">7</a></sup>. 

Thus, because marketing data, even in cases with large variations in spend (to make matters worse, in practice we typically do not see large variations in spend), are assuredly noisy, such exact methods are not promising. This gives a more precise explanation, in addition to marketer intuition, as to why identification of saturation curves is difficult. All hope is not lost however, instead we turn this into an estimation problem, which we discuss at the end of this note.
 <br>

### 2.2 S-shaped saturation curves {#s-shaped}

We first give a more precise formulation of S-shaped saturation curves. Call $f$ S-shaped on $(0,\infty)$ if it is increasing, convex up to a single inflection point $x^{*} > 0$, and concave thereafter. Put another way, $f'$ rises to an interior peak and then falls. Let's also define a special function that will be of use to us throughout this section, the sigmoid, $\sigma(x) = \frac{1}{1 + e^{-x}}$. We'll first prove a density result that will be fruitful for both situations described. 

#### Lemma 3
{: .no_toc}

<div class="lemma"> 
Let $\mathcal{D} = \{ \sum_{i \in S}f_{i} \}$ where $f_{i} = a_{i} \sigma(b_{i}( x - c_{i}))$ for some $a_{i}$ non-negative, $b_{i}$ positive, $c_{i}$ real, and for some countable set $S$. Also, let $C^{*}$ denote the set of non-negative, continuous, non-decreasing functions. For any compact interval $K \subset \mathbb{R}$ we can approximate elements of $C^{*}(K)$ uniformly by sums of constants and elements of $\mathcal{D}$ in the sup norm.
</div>

<details>
  <summary>Click to expand proof</summary>

<div class="proof">
<br>
Choose $f \in C^{*}(K)$ and let $K = [\alpha,\beta]$ for some $\alpha, \beta \in \mathbb{R}$. Fix $\epsilon > 0$ and choose $\delta > 0$ such that $\left| f(x) - f(y) \right| < \epsilon$ if $\left| x - y \right| < \delta$. Define a partition $P_{\delta} = \{p_{0} = \alpha, p_{1}, ...,p_{N-1} = \beta\}$ of $K$ such that the difference between any successive $p_{i}$ is equal to $ h <\delta$. Define
$$g(x) = \sum_{j = 1}^{N - 1}c_{j}\mathbb{1}_{\{x \geq p_{j}\}} + f(\alpha),$$
where $c_{j} = f(p_{j}) - f(p_{j - 1})$. Observe that $g$ is monotonically increasing and if $x_{0} \in [p_{s - 1}, p_{s})$ then $g(x_{0}) = f(p_{s - 1})$. Hence,
$$\sup_{x \in K} \left| f - g\right| < \epsilon.$$
 <br>
 <br>
Next, define $G(x) = \sum_{j = 1}^{N - 1}c_{j}\sigma(w(x - p_{j})) + f(\alpha)$ for positive $w \in \mathbb{R}$ and observe that the inequality
$$\left|\mathbb{1}_{\{x \geq 0\}} - \sigma(x) \right| \leq e^{-\left| x \right|}$$
implies that 
$$\left| g(x) - G(x) \right| \leq \sum_{j}c_{j}e^{-\left| w(x - p_{j}) \right|} .$$
Fix $x_{0} \in [p_{s - 1}, p_{s})$ and observe that if we sum the contribution from every $j \neq s - 1, s$ in the sum it is at most $(f(\beta) - f(\alpha))e^{-wh}$ and the terms $j = s - 1, s$ contribute at most $2\epsilon$ together. So altogether, 
$$\sup_{x \in K} \left| f - G \right| < \epsilon + 2\epsilon + (f(\beta) - f(\alpha))e^{-wh} = 3\epsilon + (f(\beta) - f(\alpha))e^{-wh}.$$
If we choose $w > \frac{1}{h}\log(\frac{f(\beta) - f(\alpha)}{\epsilon})$, the overall supremum is $O(\epsilon)$ and the result follows. 
 <br>
</div>

</details>


In a similar vein to the Concave case, it again makes sense for practitioners to assume that if $f$ is the function we are approximating then: 

* $f(0) = 0$

* $f$ has a finite asymptote at $\infty$

Next, observe that the members of both familes can be described conveniently in terms of the sigmoid function, in particular: 

* **Hill**: $H(x) = \frac{ax^{n}}{k^{n} + x^{n}}$, for $a \geq 0, k > 0,  n > 1$, so, $H(x) = a \cdot \sigma(n(\log x - \log k))$ 

* **Logistic**: $L(x) = \frac{1}{1 + e^{-a(x - b)}}$, for $a, b \geq 0$, so, $L(x) = \sigma(a(x - b))$ 


In the Hill case, our argument needs a slight adjustment. The lemma applies in $z = \log(x)$ on $[\log(\alpha), \log(\beta)]$, and hence compact intervals of $[\alpha, \beta] \subset (0, \infty)$. We can extend to $0$ however through monotonicity: if $f$ is the function we are approximating then since $f(0) = 0$ we can take our approximating sum sufficiently small on $[0, \delta]$ for any $\delta > 0$ ensuring they are close. Continuing, we note that assuming convergence of the sum of the Hill functions that $f(0) = f'(0) = 0$. So, in that sense we see that the Hill case has some rigid structure at the origin but is flexible elsewhere. In the Logistic case if we don't use a negative constant we can get arbitrarily close to being $0$ at $x = 0$ however the positivity of the sigmoids ensures we are always positive in totality. Our conclusion here for both cases is that unlike the  Concave case, given a function we want to approximate, we have a constructive regression strategy (no need to identify atoms as in the Concave case) to generate estimating functions.

## 3. Applied modeling {#modeling}

In this section we discuss two strategies for estimating saturation curves in the Concave case.

### Strategy 1: Non-negative least squares {#nnls}

We first consider the generalized version of our problem without the assumptions that our function vanishes at $0$ and has an asymptote at infinity. To do this we discretize the problem by selecting a log spaced grid $B$ of points $(b_{1}, b_{2},..,b_{N})$, where the $N$ (say $N \text{~} 200$) points are chosen from a plausible range for a specific marketing channel. These $N$ points play the role of the atomic approximation from Lemma 2. If we let our regression pairs be $(x_{i}, y_{i})$ where the $x_{i}$ are spend levels and the $y_{i}$ are estimated levels of incremental outcomes, we can form a design matrix $X_{ij} = 1 - e^{-x_{i}b_{j}}$. If we let $Y$ denote the vector of our $y_{i}$ and $a$ denote the vector corresponding to our $a_{j} \geq 0$ (recall our summands are of the form $a_{j}(1 - e^{-b_{j}x})$ ) we have the problem:

$$ \arg\min_{a \in \mathbb{R}^{N}_{\geq 0}}\Vert{}Y - Xa\Vert{}_2^2, $$

in other words, Non-Negative least squares. Let's look at a worked example of this. 

To begin, let's outline our data constraints and strategy. For data we assume that we have one year of weekly aggregated spend ($52$ weeks of observations) with a scaled spend range of \\$0.05 to \\$1.00. Next, we assume that our hypothetical rates (the $b_{i}$ values) fall in the range from $0.1$ to $100$ and take $200$ log-spaced candidates in that range. Given that we can begin by defining our variables in the code below: 

```python
import matplotlib
import numpy as np
from scipy.optimize import nnls

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns


SEED = 42
rng = np.random.default_rng(SEED)

# Ground-truth mixture: f(x) = sum_i a_i * (1 - exp(-b_i * x))
TRUE_ATOMS = [(0.55, 2.0), (0.45, 12.0)]

 # (spend, incremental) pairs: one year of weekly data
NUM_OBSERVATIONS = 52
# Observed spend window                  
MIN_SPEND, MAX_SPEND = 0.05, 1.0     
# Observation noise
SIGMA = 0.02 
# Candidate decay rates (play the role of atoms of Lemma 2)               
NUM_DECAY_CANDIDATES = 200                 
# min/max hypothetical rates
MIN_B, MAX_B = 0.1, 100.0

def f_true(x: np.ndarray) -> np.ndarray:
    return sum(a * (1.0 - np.exp(-b * x)) for a, b in TRUE_ATOMS)

def design(x: np.ndarray, b: np.ndarray) -> np.ndarray:
    return 1.0 - np.exp(-np.outer(x, b))

# Generate random observed spend levels
x = np.sort(rng.uniform(MIN_SPEND, MAX_SPEND, NUM_OBSERVATIONS))
# Generate distorted observed values 
y = f_true(x) + rng.normal(0.0, SIGMA, NUM_OBSERVATIONS)
# Genrate log-spaced candidate values 
b_grid = np.logspace(np.log10(MIN_B), np.log10(MAX_B), NUM_DECAY_CANDIDATES)
# Generate our design matrix X
X = design(x, b_grid)
```
Next, we calculate the condition number of matrix $X$ and use it as a heuristic to determine the numerical stability of $X$. We also show a plot of the ratios of the singular values to the largest singular value.

```python
# How much of the grid is numerically distinguishable at all?
s = np.linalg.svd(X, compute_uv=False)
print(f"design matrix: {X.shape[0]} x {X.shape[1]}, cond = {s[0] / s[-1]:.2e}")
for tolerance in (1e-2, 1e-4, 1e-6):
    print(f"  singular values above {tolerance:g} * sigma_max: {(s > tolerance * s[0]).sum()}")

fig, ax = plt.subplots(figsize=(6, 4))

sns.lineplot(
    x=np.arange(1, len(s) + 1),
    y=s / s[0],
    marker="o",
    markersize=3,
    ax=ax
)

ax.set_yscale("log")
ax.set_xlabel("index")
ax.set_ylabel(r"$\sigma_k / \sigma_1$")
ax.set_title("Singular values of the design matrix")
ax.grid(alpha=0.3)

fig.tight_layout()
fig.savefig("fig1_singular_values.png", dpi=160)
plt.close(fig)
```

<figure>
  <img class="plot"
       src="{{ '/assets/images/fig1_singular_values.png' | relative_url }}"
       alt="Singular values of the design matrix, normalised by the largest, on a log scale. The spectrum falls about sixteen orders of magnitude over the first twenty-five indices before flattening at machine precision."
       width="960" height="640" loading="lazy">
  <figcaption>
    The spectrum decays to machine precision by roughly the twenty-fifth
    index: beyond that, the candidate rates are numerically
    indistinguishable from one another.
  </figcaption>
</figure>

The results in this example  show that our rates can be indistinguishable and do not uniquely determine our system. Continuing, we fit our non-negative least squares model between our design matrix $X$ and observed values $y$. We define an atom $a$ here as active if it exceeds $10^{-10}$, otherwise we discard it.

```python
NNLS_MAXITER = 50 * NUM_DECAY_CANDIDATES
TOLERANCE = 1e-10

a_hat, rnorm = nnls(X, y, maxiter=NNLS_MAXITER)
active = np.flatnonzero(a_hat > TOLERANCE)
print(f"\nNNLS fit: residual RMS = {rnorm / np.sqrt(NUM_OBSERVATIONS):.4f} (noise sigma = {SIGMA})")
print(f"active atoms: {len(active)} of {NUM_DECAY_CANDIDATES} (bounded by NUM_OBSERVATIONS = {NUM_OBSERVATIONS})")
print("  recovered (rate, weight):",
      [(round(b_grid[j], 2), round(a_hat[j], 3)) for j in active])
print(f"  true       (rate, weight): {[(b, a) for a, b in TRUE_ATOMS]}")
```
In this example we have $5$ active atoms ($a_{i}$ values) out our inital $200$ possible candidates. This is a win and demonstrates that despite possible identifiability issues with the rates, our solution space can be sparse. To further understand our system we will consider what happens when we perturb our data slightly. We will test this by re-sampling the rows of $X$, fitting these values against their correpsponding values in $y$.  

```python
NUM_BOOTSTRAP_REPLICATES = 500
# extrapolate to 3x the observed window
SPEND_EXTRAP = 3.0         

x_plot = np.linspace(1e-3, SPEND_EXTRAP * MAX_SPEND, 400)
X_plot = design(x_plot, b_grid)

curves, masks, num_active, n_failed = [], [], [], 0
for _ in range(NUM_BOOTSTRAP_REPLICATES):
    idx = rng.integers(0, NUM_OBSERVATIONS, NUM_OBSERVATIONS)
    try:
        a_r, _ = nnls(X[idx], y[idx], maxiter=NNLS_MAXITER)
    except RuntimeError:   # Lawson-Hanson stalls on degenerate resamples
        n_failed += 1
        continue
    curves.append(X_plot @ a_r)
    masks.append(a_r > TOLERANCE)
    num_active.append(masks[-1].sum())

curves = np.array(curves)
masks = np.array(masks)
num_active = np.array(num_active)
print(f"\nbootstrap: {len(curves)} replicates converged, {n_failed} dropped")
```

Next, let's look at pointwise estimate ranges within our spend range and from $2$ to $3$ times it.
```python
lo, med, hi = np.percentile(curves, [2.5, 50, 97.5], axis=0)
width_in = (hi - lo)[x_plot <= MAX_SPEND].max()
width_out = (hi - lo)[x_plot >= 2.0 * MAX_SPEND].max()
print(f"95% band width: max inside window = {width_in:.4f}, "
      f"max beyond 2x window = {width_out:.4f}")
```
This gives that our maximum band width within our spend range is $0.08$ and beyond $2$ times our spend limit it's $0.4639$. So, we have tight confidence within our window and less confidence outside of it, which is not unexpected. Continuing, let's look at the distribution of active atoms over our samples. 

```python
fig, ax = plt.subplots(figsize=(8, 5))

sns.histplot(data=num_active, ax=ax)

ax.set_xlabel("Active Atoms")
ax.set_ylabel("Frequency")
ax.set_title("Histogram of Active Atoms")

fig.tight_layout()
fig.savefig("fig2_frequency_of_active_atoms.png", dpi=160)
plt.close(fig)

print(f"active atoms per replicate: median {np.median(num_active):.0f}, "
      f"range {num_active.min()}-{num_active.max()}")
freq = masks.mean()
print(f"largest per-atom activation frequency: {freq.max():.2f} "
      f"(an atom active in every replicate would have 1.00)")
```
<figure>
  <img class="plot"
       src="{{ 'assets/images/fig2_frequency_of_active_atoms.png' | relative_url }}"
       alt="Histogram of active atoms over re-sampling."
       width="960" height="640" loading="lazy">
  <figcaption>
    Histogram of active atoms over re-sampling. Median active atoms is 5 and the range is 3-7.
  </figcaption>
</figure>

Next we check our model fits within and outside of our observed spend window.

```python
fig, ax = plt.subplots(figsize=(7, 4.5))

# Observed spend window
ax.axvspan(0, MAX_SPEND, color="0.93", label="observed spend window")

# Bootstrap confidence interval
ax.fill_between(
    x_plot, lo, hi,
    color="C0",
    alpha=0.3,
    label="bootstrap 95% band"
)

# Bootstrap median
sns.lineplot(
    x=x_plot,
    y=med,
    ax=ax,
    color="C0",
    linewidth=1.5,
    label="bootstrap median"
)

# True curve
sns.lineplot(
    x=x_plot,
    y=f_true(x_plot),
    ax=ax,
    color="black",
    linestyle="--",
    linewidth=1.5,
    label="true curve"
)

# Observed data points
sns.scatterplot(
    x=x,
    y=y,
    ax=ax,
    s=9,
    color="0.3",
    label="data"
)

# Axis labels and title
ax.set_xlabel("Spend (Normalized)")
ax.set_ylabel("Incremental outcome")
ax.set_title("NNLS Fit")

# Legend
ax.legend(frameon=False, fontsize=8, loc="lower right")

fig.tight_layout()
fig.savefig("fig3_curve_fit.png", dpi=160)
plt.close(fig)
```
<figure>
  <img class="plot"
       src="{{ 'assets/images/fig3_curve_fit.png' | relative_url }}"
       alt="NNLS Fit"
       width="960" height="640" loading="lazy">
  <figcaption>
    Plot of replicate curves, inside and outside of the observed spend window.
  </figcaption>
</figure>

We again see that despite rarely recovering the true rates, our fits are quite tight within the observed spend window. Outside of it however, we see more disagreement. This matches typical advice from open source model that advises against extrapolating beyond the observed spend window. Finally, let's look at the distribution of our active atoms amongst our bootstrap samples.

```python
fig, ax = plt.subplots(figsize=(7, 3.8))

bar_width = (np.log10(B_HI) - np.log10(B_LO)) / NUM_GRID * 100

sns.barplot(
    x=np.log10(b_grid),
    y=freq,
    ax=ax,
    width=bar_width,
    native_scale=True,  # Treats x as continuous numeric values rather than categories
)

for a, b in TRUE_ATOMS:
    ax.axvline(np.log10(b), color="k", ls="--", lw=1)

ax.set(
    xlabel=r"$\log_{10}$ rate $b_j$ (dashed: true rates)",
    ylabel="Fraction of Bootstrap Fits\nWith the Atom Active",
    title="Atom Activation Across Bootstrap Replicates",
)

fig.tight_layout()
fig.savefig("fig4_atom_stability.png", dpi=160)
plt.close(fig)
```
<figure>
  <img class="plot"
       src="{{ 'assets/images/fig4_atom_stability.png' | relative_url }}"
       alt="Atom Activation Across Replicates"
       width="960" height="640" loading="lazy">
  <figcaption>
    Distribution of activated atoms. Despite the fact that we rarely recover the true atoms, our fit is good in sample.
  </figcaption>
</figure>

```python
# Tertiary modeling method

LAM = 10.0          # equality-constraint weight: check a.sum() against A
A_GRID = np.concatenate([np.arange(0.85, 1.5, 0.05), np.arange(1.5, 4.6, 0.25)])
X_FAR = design(np.array([2.0]), b_grid)    # prediction at 2x the window


def profile(A: float):
    """NNLS subject to sum(a) ~= A, via a weighted constraint row."""
    X_aug = np.vstack([X, LAM * np.ones((1, NUM_DECAY_CANDIDATES))])
    y_aug = np.concatenate([y, [LAM * A]])
    try:
        a, _ = nnls(X_aug, y_aug, maxiter=200 * NUM_DECAY_CANDIDATES)
    except RuntimeError:
        return None
    return a


rows = []
for A in A_GRID:
    a = profile(A)
    if a is None:
        print(f"  A = {A:.2f}: did not converge")
        continue
    rows.append((A, np.linalg.norm(X @ a - y) / np.sqrt(NUM_OBSERVATIONS), a.sum(), (X_FAR @ a)[0]))

r_min = min(r for _, r, _, _ in rows)
print(f"\n{'A':>6} {'resid':>8} {'vs best':>9} {'sum(a)':>8} {'f(2.0)':>8}")
for A, r, tot, far in rows:
    print(f"{A:>6.2f} {r:>8.4f} {r / r_min:>9.3f} {tot:>8.3f} {far:>8.3f}")

ident = [(A, far) for A, r, _, far in rows if r <= 1.02 * r_min]
print(f"\nidentified set for A (within 2% of best fit): "
      f"[{min(A for A, _ in ident):.2f}, {max(A for A, _ in ident):.2f}]")
print(f"implied f(2.0) across it: "
      f"[{min(f for _, f in ident):.3f}, {max(f for _, f in ident):.3f}]")
```


### Strategy 2: Tikhonov regularization {#tikhonov}

Consider $g \geq 0$ such that:

$$F(s) = \int_{0}^{\infty}(1 - e^{-st})g(t)dt,$$

and instead of trying to invert this relationship directly we again discretize. Take a log-spaced grid $t_1, \dots, t_M$ on $(0, \infty)$ and approximate the integral by a quadrature sum, giving a matrix $A$ with $A_{ij} = (1 - e^{-s_i t_j})w_j$ for quadrature weights $w_j$. We then solve:

$$ \min_{g > 0}\Vert{}Ag - y\Vert{}_2^2 + \alpha\Vert{}Lg\Vert{}_2^2, $$  

where $\alpha > 0$ is our regularization parameter and $L$ is a penalty operator (say a second derivative estimated with finite differences) to enforce smoothness (think about a spline penalty for example). Tikhonov Regularization can be thought of as the smoothing alternative to Non-Negative Least Squares (a reasonable first approach).

## 4. Takeaways {#takeaways}

1. The concave case is rigid, but hard to identify.
    As we have seen, the closure of the concave case is the Bernstein functions, so this class has a precise, characterizable shape. The price to pay for this structure however, is the necessity of recovering the underlying measure $\mu$ from noisy data: we are compounding an ill-posed inverse problem (Laplace inversion from non-negative real-line data) by observing only a bounded spend interval. 
2. The S-shaped case is flexible but erases the shape.
    The closure of the functions we looked at here take is a much broader class, continuous monotone functions, however we have a constructive strategy to create approximations to the desired amount of accuracy. That being said, the S shape is generally not preserved: this approach recovers a monotonic curve and not necessarily meaningful aspects of it. The concave and S-shaped cases therefore differ in how much shape they impose, not in their ability to recover it. Fitting a sum of sigmoids confirms monotonicity, not S-shapedness — the inflection point is an artifact of the fit, not evidence from the data.
    In the concave case different choices of pairs $(a_{i}, b_{i})$ can produce similar curves over the observed spend range. This means that it is unwise to focus too much on individual parameters and instead on fitted curves and derived quantities such as marginal returns. Individual decay rates can be noisy and claimed precision for any media channel warrants skepticism.
3. Practical starting points.
    In the concave case, start with a small grid of candidate rates and solve non-negative least squares. The problem is convex, and its active-set structure bounds the number of non-zero weights by the number of observations — so the fit is sparse by construction, not by choice. If insufficient, Tikhonov regularization offers a smoothing alternative. In both cases, check results for stability (is the design matrix degenerate or do small perturbations in data lead to large changes in curves?) before drawing conclusions.

## References {#references}

1. <span id="ref-1"></span>Jin, Y., Wang, Y., Sun, Y., Chan, D., & Koehler, J. (2017). *Bayesian Methods for Media Mix Modeling with Carryover and Shape Effects*. Google Inc. [Link](https://research.google/pubs/bayesian-methods-for-media-mix-modeling-with-carryover-and-shape-effects/) [↩](#cite-1)

2. <span id="ref-2"></span>Google. *Meridian*: open-source marketing mix modeling. [Documentation](https://developers.google.com/meridian) · [Source](https://github.com/google/meridian) [↩](#cite-2)

3. <span id="ref-3"></span>Meta Marketing Science. *Robyn*: open-source marketing mix modeling. [Documentation](https://facebookexperimental.github.io/Robyn/) · [Source](https://github.com/facebookexperimental/Robyn) [↩](#cite-3)

4. <span id="ref-4"></span>Schilling, R. L., Song, R., & Vondraček, Z. (2012). *Bernstein Functions: Theory and Applications* (2nd ed.), Theorem 3.2. De Gruyter. [doi:10.1515/9783110269338](https://doi.org/10.1515/9783110269338) [↩](#cite-4)

5. <span id="ref-5"></span>Iyer, G., Leger, N., & Pego, R. L. (2016). *Coagulation and universal scaling limits for critical Galton-Watson processes*. [arXiv:1610.04647](https://arxiv.org/abs/1610.04647) [↩](#cite-5)

6. <span id="ref-6"></span>Widder, D. V. (1946). *The Laplace Transform*. Princeton University Press. [↩](#cite-6)

7. <span id="ref-7"></span>Gzyl, H., Tagliani, A., & Milev, M. (2013). Laplace transform inversion on the real line is truly ill-conditioned. *Applied Mathematics and Computation*, 219(17), 9805–9809. [doi:10.1016/j.amc.2013.03.112](https://doi.org/10.1016/j.amc.2013.03.112) [↩](#cite-7)
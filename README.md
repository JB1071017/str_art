# 🎨 The Mathematics of String Art
*A Complete Mathematical and Theoretical Framework for Image-to-Thread Conversion*

---

## 🧠 Abstract

**String art** is the mathematical process of representing curves and images using only straight threads.  
This document explains how an image can be represented as a **matrix equation**, how threads correspond to vectors, and how optimization and geometry combine to produce smooth patterns from straight lines.

We develop:
- The **matrix formulation**: how to model image pixels and string contributions,  
- The **intensity model**: linear and exponential formulations for thread overlap,  
- The **geometric envelope**: how straight lines form parabolas and curves,  
- And the **optimization equations** that determine which threads reproduce a target image.

---

## 1. Introduction

String art transforms straight lines into continuous shapes.  
The effect is achieved by connecting fixed pins on a board with thread — each line darkens part of the background.  
By mathematically modeling each line’s contribution to every pixel, we can express the entire artwork as a **matrix equation** and optimize it to reproduce a target image.

---

## 2. Image to Matrix Representation

Let:

- H, W: image height and width  
- m = H × W: number of pixels  
- N: number of candidate threads (pin-to-pin segments)  
- b ∈ ℝᵐ: target image brightness (flattened)  
- A ∈ ℝᵐˣᴺ: matrix where each column describes one thread’s contribution to pixels  
- x ∈ ℝᴺ: vector describing which threads are used and how much

Then, the predicted **darkness** at each pixel is:

```math
\boxed{\hat{b}' = A x}
```

where:

```math
b' = b_0 \mathbf{1} - b
```

is the **target darkness vector**, and b₀ = 1 (white background).

Each column a^(j) of A represents one thread segment connecting two pins.

---

## 3. Building Each Column of A

For a segment j joining two pin coordinates Pₛ = (xₛ, yₛ) and Pₜ = (xₜ, yₜ):

```math
(a^{(j)})_i = \frac{1}{|P_i|}\int_{P_i} K\big(d(p, \ell_j)\big)\;1_{\text{proj in segment}}(p)\; dp
```

Where:

- Pᵢ: pixel area,  
- d(p, ℓⱼ): perpendicular distance from pixel p to line ℓⱼ,  
- K(d): thickness kernel (e.g. K(d) = max(0, 1 - d/ρ)),  
- 1₍proj₎(p): 1 if the projection of p lies within the segment.

This converts a **physical thread** into a **vector column** showing how much it darkens each pixel.

---

## 4. Intensity Models

### 4.1 Additive Linear Model

```math
\hat{b}' = A x
```

### 4.2 Exponential (Saturating) Model

```math
I_i = I_{0,i} \exp\Big(-\sum_{j=1}^N \beta_j (a^{(j)})_i x_j \Big)
```

Take logarithm:

```math
-\ln\Big(\frac{I_i}{I_{0,i}}\Big) = \sum_{j=1}^N \beta_j (a^{(j)})_i x_j
```

Matrix form:

```math
y = A(\beta \odot x)
```

---

## 5. Classical Geometry of String Art

Points:

```math
D(t) = (t, 0), \quad E(t) = (1, t), \quad t \in [0, 1]
```

Each thread line:

```math
y = \frac{t}{1-t}(x - t)
```

Multiply by (1 - t):

```math
(1 - t)y = t x - t^2
```

Define:

```math
F(x, y, t) = (1 - t)y - t x + t^2 = 0
```

Envelope conditions:

```math
\begin{cases}
F(x, y, t) = 0, \\
\dfrac{\partial F}{\partial t}(x, y, t) = 0
\end{cases}
```

Differentiate:

```math
\dfrac{\partial F}{\partial t} = -y - x + 2t = 0 \Rightarrow t = \dfrac{x + y}{2}
```

Substitute back:

```math
(x + y)^2 = 4y
```

A **parabola** — the visual foundation of string art curves.

---

## 6. Optimization Problem

```math
\min_x \|A x - b'\|_2^2
```

Solution:

```math
x^* = (A^T A)^{-1} A^T b'
```

NNLS:

```math
\min_{x \ge 0} \|A x - b'\|_2^2
```

LASSO (sparse):

```math
\boxed{\min_{x \ge 0} \frac{1}{2}\|A x - b'\|_2^2 + \lambda \|x\|_1}
```

Binary:

```math
\min_{x \in \{0,1\}^N} \|A x - b'\|_2^2 \quad \text{s.t. } \sum_j x_j \le K
```

---

## 7. Greedy Approximation

Residual:

```math
r = b' - A x
```

Coefficient:

```math
\alpha_j^* = \frac{a^{(j)T} r}{a^{(j)T} a^{(j)}}
```

Error reduction:

```math
\Delta_j = \frac{(a^{(j)T} r)^2}{a^{(j)T} a^{(j)}}
```

Update:

```math
x_{j^*} \leftarrow x_{j^*} + \alpha_{j^*}, \quad r \leftarrow r - \alpha_{j^*} a^{(j^*)}
```

Repeat until convergence.

---

## 8. Continuous Thread Constraints

Pins = vertices V; segments = edges E; binary z_{uv} ∈ {0,1}.

Flow:

```math
\sum_v z_{uv} = 1, \quad \sum_u z_{uv} = 1
```

Subtour elimination:

```math
u_u - u_v + |V| z_{uv} \le |V| - 1
```

Objective:

```math
\min_{z \in \{0,1\}} \|A x(z) - b'\|_2^2 + \gamma \sum_{uv} d_{uv} z_{uv}
```

---

## 9. Color & Perceptual Models

For RGB:

```math
\hat{b}'_c = A (\alpha_c x), \quad c \in \{R, G, B\}
```

Linearize sRGB:

```math
b_{\text{lin}} = b_{\text{sRGB}}^{2.2}
```

Perceptual loss:

```math
\min_x \mathcal{L}_{\text{perceptual}}(A x, b')
```

---

## 10. Complete Mathematical Pipeline

1. Convert target image → brightness vector b.  
2. Define pins, build matrix A.  
3. Choose model (additive / exponential).  
4. Solve optimization.  
5. Apply constraints.  
6. Render result:

```math
\hat{b} = b_0 \mathbf{1} - A x
```

---

## 11. Core Equations Summary

| Concept | Equation |
|----------|-----------|
| Linear model | ```math \hat{b}' = A x ``` |
| Target darkness | ```math b' = b_0 \mathbf{1} - b ``` |
| Exponential model | ```math I = I_0 e^{-A(\beta \odot x)} ``` |
| Least squares | ```math A^T A x = A^T b' ``` |
| LASSO | ```math \min \frac12\|A x - b'\|^2 + \lambda\|x\|_1 ``` |
| Greedy | ```math \alpha = \frac{a^T r}{a^T a},\ \Delta = \frac{(a^T r)^2}{a^T a} ``` |
| Envelope | ```math (x + y)^2 = 4y ``` |

---

## 🧵 Conclusion

String art elegantly connects **geometry**, **linear algebra**, and **visual optimization**.  
By representing every thread mathematically, any image can be reconstructed using a finite set of straight lines.

---

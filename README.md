0. Notation summary

Image size: 
𝐻
×
𝑊
H×W. Number of pixels 
𝑚
=
𝐻
⋅
𝑊
m=H⋅W.

Pixel index 
𝑖
∈
{
1
,
…
,
𝑚
}
i∈{1,…,m} corresponds to a pixel area 
𝑃
𝑖
⊂
𝑅
2
P
i
	​

⊂R
2
.

Target image (linear light, grayscale): 
𝑏
∈
𝑅
𝑚
b∈R
m
, 
𝑏
𝑖
∈
[
0
,
1
]
b
i
	​

∈[0,1] (1 = white).

Baseline background brightness: 
𝑏
0
b
0
	​

 (commonly 
𝑏
0
=
1
b
0
	​

=1).

Number of candidate straight segments (line candidates): 
𝑁
N. Index segments 
𝑗
=
1
,
…
,
𝑁
j=1,…,N.

Column vectors 
𝑎
(
𝑗
)
∈
𝑅
𝑚
a
(j)
∈R
m
 denote per-pixel contribution of segment 
𝑗
j.

Matrix 
𝐴
∈
𝑅
𝑚
×
𝑁
A∈R
m×N
, 
𝐴
=
[
 
𝑎
(
1
)
 
…
 
𝑎
(
𝑁
)
 
]
A=[a
(1)
 … a
(N)
].

Unknown vector 
𝑥
∈
𝑅
𝑁
x∈R
N
 (models weights or counts of each segment): many models use 
𝑥
𝑗
∈
{
0
,
1
}
x
j
	​

∈{0,1} or 
𝑥
𝑗
≥
0
x
j
	​

≥0.

Residual vector 
𝑟
:
=
𝑏
′
−
𝐴
𝑥
r:=b
′
−Ax, where 
𝑏
′
b
′
 is the target in the linear model (defined below).

Norms: 
∥
𝑣
∥
2
∥v∥
2
	​

 Euclidean norm, 
∥
𝑣
∥
1
∥v∥
1
	​

 
𝐿
1
L
1
 norm, 
∥
𝑣
∥
0
∥v∥
0
	​

 pseudo-norm counting nonzeros.

1. Image ↔ target vector transformation

For modeling by darkening threads on a white board, define the target darkness vector

𝑏
′
:
=
𝑏
0
1
−
𝑏
∈
𝑅
𝑚
,
b
′
:=b
0
	​

1−b∈R
m
,

so that 
𝑏
𝑖
′
∈
[
0
,
1
]
b
i
′
	​

∈[0,1] gives the darkness we must produce at pixel 
𝑖
i (0 = no darkness, 1 = full darkness).

Thus our forward model (additive) is

  
𝑏
^
′
=
𝐴
𝑥
  
(predicted darkness per pixel).
b
^
′
=Ax
	​

(predicted darkness per pixel).

Goal: choose 
𝑥
x so 
𝑏
^
′
≈
𝑏
′
b
^
′
≈b
′
 under constraints.

2. Construction of column 
𝑎
(
𝑗
)
a
(j)
 (exact integral form)

Let segment 
𝑗
j be a straight segment between continuous endpoints 
𝑃
𝑠
=
(
𝑥
𝑠
,
𝑦
𝑠
)
P
s
	​

=(x
s
	​

,y
s
	​

) and 
𝑃
𝑡
=
(
𝑥
𝑡
,
𝑦
𝑡
)
P
t
	​

=(x
t
	​

,y
t
	​

). Let the (infinite thin) line be

ℓ
𝑗
=
{
𝑃
𝑠
+
𝜏
(
𝑃
𝑡
−
𝑃
𝑠
)
  
:
  
𝜏
∈
𝑅
}
.
ℓ
j
	​

={P
s
	​

+τ(P
t
	​

−P
s
	​

):τ∈R}.

Define the per-pixel antialiased contribution of segment 
𝑗
j to pixel 
𝑖
i by integrating the cross-sectional kernel of string influence over the pixel area:

Continuous kernel model.
Let 
𝐾
:
𝑅
≥
0
→
𝑅
≥
0
K:R
≥0
	​

→R
≥0
	​

 be a radial profile modeling string thickness / visual weighting (e.g., triangular, Gaussian). For a point 
𝑝
∈
𝑅
2
p∈R
2
, define 
𝑑
(
𝑝
,
ℓ
𝑗
)
d(p,ℓ
j
	​

) the perpendicular distance from 
𝑝
p to the infinite line through the segment; and let 
1
seg
(
𝑝
)
1
seg
	​

(p) be the indicator that the orthogonal projection of 
𝑝
p onto the line falls within the segment extent (i.e., within endpoints).

Then the exact column entry for pixel 
𝑖
i is

  
(
𝑎
(
𝑗
)
)
𝑖
  
=
  
1
∣
𝑃
𝑖
∣
∫
𝑃
𝑖
𝐾
(
𝑑
(
𝑝
,
ℓ
𝑗
)
)
  
1
seg
(
𝑝
)
  
𝑑
𝑝
  
(a
(j)
)
i
	​

=
∣P
i
	​

∣
1
	​

∫
P
i
	​

	​

K(d(p,ℓ
j
	​

))1
seg
	​

(p)dp
	​


where 
∣
𝑃
𝑖
∣
∣P
i
	​

∣ is pixel area (for normalization). This gives a value in 
[
0
,
max
⁡
𝐾
]
[0,maxK]. With choice 
𝐾
(
𝑑
)
=
1
𝑑
≤
𝑡
/
2
K(d)=1
d≤t/2
	​

 we get binary coverage (string fills pixels whose center is within thickness threshold).

Discrete approximation (practical). Evaluate at pixel center 
𝑐
𝑖
c
i
	​

 or at subpixel grid and average:

(
𝑎
(
𝑗
)
)
𝑖
≈
1
𝑆
∑
𝑠
=
1
𝑆
𝐾
(
𝑑
(
𝑐
𝑖
(
𝑠
)
,
ℓ
𝑗
)
)
 
1
seg
(
𝑐
𝑖
(
𝑠
)
)
,
(a
(j)
)
i
	​

≈
S
1
	​

s=1
∑
S
	​

K(d(c
i
(s)
	​

,ℓ
j
	​

))1
seg
	​

(c
i
(s)
	​

),

where 
𝑐
𝑖
(
𝑠
)
c
i
(s)
	​

 are subpixel samples (antialiasing). The exact integral form is the theoretical definition.

Example kernels:

Triangular kernel (linear falloff):

𝐾
(
𝑑
)
=
max
⁡
(
0
,
1
−
𝑑
𝜌
)
K(d)=max(0,1−
ρ
d
	​

)

where 
𝜌
ρ is half-thickness.

Gaussian kernel:

𝐾
(
𝑑
)
=
exp
⁡
(
−
𝑑
2
2
𝜎
2
)
.
K(d)=exp(−
2σ
2
d
2
	​

).
3. Intensity / physical observation models
3.1 Additive linear model (primary)

Assume darkness sums linearly (valid when each string produces a small additive darkening, no saturation). Forward model:

  
𝑏
^
′
=
𝐴
𝑥
  
(linear additive)
b
^
′
=Ax
	​

(linear additive)

with constraints 
𝑥
≥
0
x≥0 and clipping 
𝑏
^
𝑖
′
≤
1
b
^
i
′
	​

≤1 if necessary (physical maximum darkness).

3.2 Saturation / multiplicative model (Beer–Lambert approximation)

If overlapping strings attenuate light multiplicatively, then for pixel 
𝑖
i

𝐼
𝑖
=
𝐼
0
,
𝑖
∏
𝑗
=
1
𝑁
(
1
−
𝛼
𝑗
(
𝑎
(
𝑗
)
)
𝑖
)
𝑥
𝑗
I
i
	​

=I
0,i
	​

j=1
∏
N
	​

(1−α
j
	​

(a
(j)
)
i
	​

)
x
j
	​


where 
𝛼
𝑗
∈
[
0
,
1
]
α
j
	​

∈[0,1] per-segment attenuation factor and 
𝑥
𝑗
x
j
	​

 counts wraps (integer). For continuous approximation (small 
𝛼
α or many wraps) convert to exponent:

𝐼
𝑖
≈
𝐼
0
,
𝑖
exp
⁡
(
−
∑
𝑗
=
1
𝑁
𝛽
𝑗
(
𝑎
(
𝑗
)
)
𝑖
𝑥
𝑗
)
,
𝛽
𝑗
≈
−
ln
⁡
(
1
−
𝛼
𝑗
)
.
I
i
	​

≈I
0,i
	​

exp(−
j=1
∑
N
	​

β
j
	​

(a
(j)
)
i
	​

x
j
	​

),β
j
	​

≈−ln(1−α
j
	​

).

Take negative log normalized intensities:

𝑦
𝑖
:
=
−
ln
⁡
𝐼
𝑖
𝐼
0
,
𝑖
≈
∑
𝑗
𝛽
𝑗
(
𝑎
(
𝑗
)
)
𝑖
𝑥
𝑗
.
y
i
	​

:=−ln
I
0,i
	​

I
i
	​

	​

≈
j
∑
	​

β
j
	​

(a
(j)
)
i
	​

x
j
	​

.

Thus in vector form:

  
𝑦
≈
𝐴
(
𝛽
⊙
𝑥
)
  
,
y≈A(β⊙x)
	​

,

with 
⊙
⊙ elementwise multiplication. Solve for 
𝛽
⊙
𝑥
β⊙x in this transformed linear space. After solving, invert transform to obtain intensities.

3.3 Choosing which model

Use additive linear model when strings are thin / few overlaps.

Use exponential model for dense overlaps or multiple wraps. Both reduce to a linear solve after appropriate transform (either directly or with negative log).

4. Envelope derivation — full algebra for parabola example

Setup (repeat): Pins on two perpendicular edges 
𝐴
𝐵
AB and 
𝐵
𝐶
BC of unit square:

𝐴
=
(
0
,
0
)
A=(0,0), 
𝐵
=
(
1
,
0
)
B=(1,0), 
𝐶
=
(
1
,
1
)
C=(1,1).

For 
𝑡
∈
[
0
,
1
]
t∈[0,1]:

𝐷
(
𝑡
)
=
(
𝑡
,
0
)
,
𝐸
(
𝑡
)
=
(
1
,
𝑡
)
.
D(t)=(t,0),E(t)=(1,t).

Line 
𝐿
𝑡
L
t
	​

 connects 
𝐷
(
𝑡
)
D(t) and 
𝐸
(
𝑡
)
E(t).

Equation of line 
𝐿
𝑡
L
t
	​

. Slope:

𝑚
(
𝑡
)
=
𝑡
−
0
1
−
𝑡
=
𝑡
1
−
𝑡
.
m(t)=
1−t
t−0
	​

=
1−t
t
	​

.

Point-slope form through 
𝐷
(
𝑡
)
D(t):

𝑦
−
0
=
𝑚
(
𝑡
)
(
𝑥
−
𝑡
)
,
y−0=m(t)(x−t),

so

𝑦
=
𝑡
1
−
𝑡
(
𝑥
−
𝑡
)
.
y=
1−t
t
	​

(x−t).

Multiply both sides by 
1
−
𝑡
1−t to eliminate denominator:

(
1
−
𝑡
)
𝑦
=
𝑡
𝑥
−
𝑡
2
.
(1−t)y=tx−t
2
.

Define

𝐹
(
𝑥
,
𝑦
,
𝑡
)
:
=
(
1
−
𝑡
)
𝑦
−
𝑡
𝑥
+
𝑡
2
.
F(x,y,t):=(1−t)y−tx+t
2
.

Points 
(
𝑥
,
𝑦
)
(x,y) lying on line 
𝐿
𝑡
L
t
	​

 satisfy 
𝐹
(
𝑥
,
𝑦
,
𝑡
)
=
0
F(x,y,t)=0.

Envelope condition. Envelope points 
(
𝑥
,
𝑦
)
(x,y) are those for which the line 
𝐿
𝑡
L
t
	​

 is tangent to the envelope: there exists 
𝑡
t with

𝐹
(
𝑥
,
𝑦
,
𝑡
)
=
0
,
∂
𝐹
∂
𝑡
(
𝑥
,
𝑦
,
𝑡
)
=
0.
F(x,y,t)=0,
∂t
∂F
	​

(x,y,t)=0.

Compute derivative:

∂
𝐹
∂
𝑡
=
−
𝑦
−
𝑥
+
2
𝑡
.
∂t
∂F
	​

=−y−x+2t.

Set 
∂
𝑡
𝐹
=
0
∂
t
	​

F=0:

2
𝑡
=
𝑥
+
𝑦
⟹
𝑡
=
𝑥
+
𝑦
2
.
2t=x+y⟹t=
2
x+y
	​

.

Substitute into 
𝐹
=
0
F=0. First compute 
1
−
𝑡
=
1
−
𝑥
+
𝑦
2
=
2
−
𝑥
−
𝑦
2
1−t=1−
2
x+y
	​

=
2
2−x−y
	​

. Then:

𝐹
=
(
1
−
𝑡
)
𝑦
−
𝑡
𝑥
+
𝑡
2
=
0
F=(1−t)y−tx+t
2
=0

becomes

2
−
𝑥
−
𝑦
2
 
𝑦
−
𝑥
+
𝑦
2
 
𝑥
+
(
𝑥
+
𝑦
2
)
2
=
0.
2
2−x−y
	​

y−
2
x+y
	​

x+(
2
x+y
	​

)
2
=0.

Multiply both sides by 4 to clear denominators:

(
2
−
𝑥
−
𝑦
)
(
2
𝑦
)
−
2
(
𝑥
+
𝑦
)
𝑥
+
(
𝑥
+
𝑦
)
2
=
0.
(2−x−y)(2y)−2(x+y)x+(x+y)
2
=0.

Compute terms:

Left term:

(
2
−
𝑥
−
𝑦
)
(
2
𝑦
)
=
4
𝑦
−
2
𝑥
𝑦
−
2
𝑦
2
.
(2−x−y)(2y)=4y−2xy−2y
2
.

Second term:

−
2
(
𝑥
+
𝑦
)
𝑥
=
−
2
𝑥
2
−
2
𝑥
𝑦
.
−2(x+y)x=−2x
2
−2xy.

Third term:

(
𝑥
+
𝑦
)
2
=
𝑥
2
+
2
𝑥
𝑦
+
𝑦
2
.
(x+y)
2
=x
2
+2xy+y
2
.

Sum them:

(
4
𝑦
−
2
𝑥
𝑦
−
2
𝑦
2
)
+
(
−
2
𝑥
2
−
2
𝑥
𝑦
)
+
(
𝑥
2
+
2
𝑥
𝑦
+
𝑦
2
)
=
0.
(4y−2xy−2y
2
)+(−2x
2
−2xy)+(x
2
+2xy+y
2
)=0.

Group like terms:

𝑥
2
x
2
: 
−
2
𝑥
2
+
𝑥
2
=
−
𝑥
2
−2x
2
+x
2
=−x
2
.

𝑥
𝑦
xy: 
−
2
𝑥
𝑦
−
2
𝑥
𝑦
+
2
𝑥
𝑦
=
−
2
𝑥
𝑦
−2xy−2xy+2xy=−2xy.

𝑦
2
y
2
: 
−
2
𝑦
2
+
𝑦
2
=
−
𝑦
2
−2y
2
+y
2
=−y
2
.

𝑦
y: 
4
𝑦
4y.

So we have:

−
𝑥
2
−
2
𝑥
𝑦
−
𝑦
2
+
4
𝑦
=
0.
−x
2
−2xy−y
2
+4y=0.

Multiply by 
−
1
−1:

𝑥
2
+
2
𝑥
𝑦
+
𝑦
2
−
4
𝑦
=
0.
x
2
+2xy+y
2
−4y=0.

Notice 
𝑥
2
+
2
𝑥
𝑦
+
𝑦
2
=
(
𝑥
+
𝑦
)
2
x
2
+2xy+y
2
=(x+y)
2
. So

(
𝑥
+
𝑦
)
2
−
4
𝑦
=
0
⟹
(
𝑥
+
𝑦
)
2
=
4
𝑦
.
(x+y)
2
−4y=0⟹(x+y)
2
=4y.

This is the final implicit envelope equation. Solve for 
𝑦
y explicitly if desired: set 
𝑠
=
𝑥
+
𝑦
s=x+y then 
𝑠
2
=
4
𝑦
s
2
=4y and 
𝑦
=
𝑠
2
/
4
y=s
2
/4 but since 
𝑠
=
𝑥
+
𝑦
s=x+y, can solve quadratic in 
𝑦
y if needed. This curve is a parabola opening to the right (as can be algebraically manipulated).

Hence the envelope is a parabola — this completes the exact derivation.

5. Optimization formulations (full equations & optimality conditions)

We now pose the main inverse problems and write their algebraic optimality conditions.

5.1 Linear least squares (relaxation)

Problem.

  
min
⁡
𝑥
∈
𝑅
𝑁
  
𝐽
(
𝑥
)
:
=
∥
𝐴
𝑥
−
𝑏
′
∥
2
2
  
.
x∈R
N
min
	​

J(x):=∥Ax−b
′
∥
2
2
	​

	​

.

Normal equations (unconstrained). Set gradient to zero:

∇
𝐽
(
𝑥
)
=
2
𝐴
⊤
(
𝐴
𝑥
−
𝑏
′
)
=
0
⟹
𝐴
⊤
𝐴
𝑥
=
𝐴
⊤
𝑏
′
.
∇J(x)=2A
⊤
(Ax−b
′
)=0⟹A
⊤
Ax=A
⊤
b
′
.

If 
𝐴
⊤
𝐴
A
⊤
A invertible:

  
𝑥
⋆
=
(
𝐴
⊤
𝐴
)
−
1
𝐴
⊤
𝑏
′
  
.
x
⋆
=(A
⊤
A)
−1
A
⊤
b
′
	​

.

Tikhonov regularization (ridge).

min
⁡
𝑥
∥
𝐴
𝑥
−
𝑏
′
∥
2
2
+
𝜆
∥
𝑥
∥
2
2
⟹
(
𝐴
⊤
𝐴
+
𝜆
𝐼
)
𝑥
=
𝐴
⊤
𝑏
′
.
x
min
	​

∥Ax−b
′
∥
2
2
	​

+λ∥x∥
2
2
	​

⟹(A
⊤
A+λI)x=A
⊤
b
′
.

Nonnegativity constraint (NNLS).

min
⁡
𝑥
≥
0
∥
𝐴
𝑥
−
𝑏
′
∥
2
2
.
x≥0
min
	​

∥Ax−b
′
∥
2
2
	​

.

KKT conditions: There exists dual vector 
𝜇
≥
0
μ≥0 such that

𝐴
⊤
(
𝐴
𝑥
−
𝑏
′
)
+
𝜇
=
0
,
𝜇
𝑗
𝑥
𝑗
=
0
 
∀
𝑗
,
𝑥
≥
0
,
 
𝜇
≥
0.
A
⊤
(Ax−b
′
)+μ=0,μ
j
	​

x
j
	​

=0 ∀j,x≥0, μ≥0.
5.2 LASSO (sparsity via 
𝐿
1
L
1
)

Problem

  
min
⁡
𝑥
≥
0
  
1
2
∥
𝐴
𝑥
−
𝑏
′
∥
2
2
+
𝜆
∥
𝑥
∥
1
  
.
x≥0
min
	​

2
1
	​

∥Ax−b
′
∥
2
2
	​

+λ∥x∥
1
	​

	​

.

(We include 
𝑥
≥
0
x≥0 since negative passes don't make sense.)

Subgradient optimality. At optimum 
𝑥
⋆
x
⋆
 there exists 
𝑠
∈
∂
∥
𝑥
⋆
∥
1
s∈∂∥x
⋆
∥
1
	​

 (subgradient) with components

𝑠
𝑗
=
{
1
,
	
𝑥
𝑗
⋆
>
0
,


∈
[
0
,
1
]
,
	
𝑥
𝑗
⋆
=
0
,
s
j
	​

={
1,
∈[0,1],
	​

x
j
⋆
	​

>0,
x
j
⋆
	​

=0,
	​


and

𝐴
⊤
(
𝐴
𝑥
⋆
−
𝑏
′
)
+
𝜆
𝑠
=
0.
A
⊤
(Ax
⋆
−b
′
)+λs=0.
5.3 Binary constrained selection (combinatorial)

Problem

  
min
⁡
𝑥
∈
{
0
,
1
}
𝑁
  
∥
𝐴
𝑥
−
𝑏
′
∥
2
2
s.t.
1
⊤
𝑥
≤
𝐾
  
.
x∈{0,1}
N
min
	​

∥Ax−b
′
∥
2
2
	​

s.t.1
⊤
x≤K
	​

.

This is NP-hard (subset selection). Exact solution via integer programming:

min
⁡
𝑥
∈
{
0
,
1
}
𝑁
∑
𝑖
=
1
𝑚
(
∑
𝑗
=
1
𝑁
𝑎
𝑖
𝑗
𝑥
𝑗
−
𝑏
𝑖
′
)
2
s.t.
∑
𝑗
𝑥
𝑗
≤
𝐾
.
x∈{0,1}
N
min
	​

i=1
∑
m
	​

(
j=1
∑
N
	​

a
ij
	​

x
j
	​

−b
i
′
	​

)
2
s.t.
j
∑
	​

x
j
	​

≤K.

Can be linearized with additional variables 
𝑧
𝑖
z
i
	​

 for squared terms but becomes quadratic 0-1 program; use MIQP or branch-and-bound.

6. Greedy selection: exact per-step formula & optimal line weight

Greedy (matching pursuit) useful and fast. Suppose current solution 
𝑥
x (initially 0) with residual

𝑟
:
=
𝑏
′
−
𝐴
𝑥
.
r:=b
′
−Ax.

Consider adding one column 
𝑎
=
𝑎
(
𝑗
)
a=a
(j)
 with scalar coefficient 
𝛼
≥
0
α≥0, giving new 
𝑥
′
=
𝑥
+
𝛼
𝑒
𝑗
x
′
=x+αe
j
	​

 and residual 
𝑟
′
=
𝑏
′
−
𝐴
𝑥
′
=
𝑟
−
𝛼
𝑎
r
′
=b
′
−Ax
′
=r−αa.

We want to choose 
𝛼
α to minimize 
∥
𝑟
−
𝛼
𝑎
∥
2
2
∥r−αa∥
2
2
	​

. This is a 1D least-squares:

Optimal 
𝛼
⋆
α
⋆
:

𝛼
⋆
=
arg
⁡
min
⁡
𝛼
∈
𝑅
∥
𝑟
−
𝛼
𝑎
∥
2
2
=
𝑎
⊤
𝑟
𝑎
⊤
𝑎
.
α
⋆
=arg
α∈R
min
	​

∥r−αa∥
2
2
	​

=
a
⊤
a
a
⊤
r
	​

.

If 
𝛼
α constrained 
𝛼
≥
0
α≥0, use 
𝛼
⋆
=
max
⁡
(
0
,
𝑎
⊤
𝑟
𝑎
⊤
𝑎
)
α
⋆
=max(0,
a
⊤
a
a
⊤
r
	​

).

Error reduction 
Δ
Δ with optimal 
𝛼
⋆
α
⋆
:

Δ
:
=
∥
𝑟
∥
2
2
−
∥
𝑟
−
𝛼
⋆
𝑎
∥
2
2
.
Δ:=∥r∥
2
2
	​

−∥r−α
⋆
a∥
2
2
	​

.

Compute:

∥
𝑟
−
𝛼
𝑎
∥
2
2
=
∥
𝑟
∥
2
2
−
2
𝛼
𝑎
⊤
𝑟
+
𝛼
2
𝑎
⊤
𝑎
.
∥r−αa∥
2
2
	​

=∥r∥
2
2
	​

−2αa
⊤
r+α
2
a
⊤
a.

Plug 
𝛼
⋆
=
𝑎
⊤
𝑟
𝑎
⊤
𝑎
α
⋆
=
a
⊤
a
a
⊤
r
	​

:

Δ
=
(
𝑎
⊤
𝑟
)
2
𝑎
⊤
𝑎
.
Δ=
a
⊤
a
(a
⊤
r)
2
	​

.

Thus for greedy selection among columns 
𝑗
j pick the one maximizing 
(
𝑎
(
𝑗
)
 
⊤
𝑟
)
2
∥
𝑎
(
𝑗
)
∥
2
2
∥a
(j)
∥
2
2
	​

(a
(j)⊤
r)
2
	​

. Equivalently maximize 
∣
𝑎
(
𝑗
)
 
⊤
𝑟
∣
/
∥
𝑎
(
𝑗
)
∥
2
∣a
(j)⊤
r∣/∥a
(j)
∥
2
	​

.

This is the theoretical quantity to compute each iteration.

If instead you require 
𝛼
∈
{
0
,
1
}
α∈{0,1} (only permit adding full unit pass), the reduction formula reduces to:

Δ
=
2
𝑟
⊤
𝑎
−
∥
𝑎
∥
2
2
,
Δ=2r
⊤
a−∥a∥
2
2
	​

,

coming from 
∥
𝑟
∥
2
−
∥
𝑟
−
𝑎
∥
2
∥r∥
2
−∥r−a∥
2
.

Efficient incremental update. Because 
𝑎
a sparse, computing 
𝑎
⊤
𝑟
a
⊤
r can be done in 
𝑂
(
nnz
(
𝑎
)
)
O(nnz(a)).

7. Optimality conditions & rounding

If you solve relaxed real-valued LASSO or NNLS and need integer counts or binary selection, common approach:

Solve relaxed convex problem for 
𝑥
relax
x
relax
.

Round: 
𝑥
𝑗
round
=
1
{
𝑥
𝑗
relax
>
𝜏
}
x
j
round
	​

=1{x
j
relax
	​

>τ} or scale and discretize into integer number of passes.

Optionally refine via local greedy swapping (hill-climb) minimizing 
∥
𝐴
𝑥
−
𝑏
′
∥
2
∥Ax−b
′
∥
2
.

Mathematical guarantee: rounding can increase error; theoretical bounds exist under incoherence/RIP assumptions (see compressed sensing literature). The specific bound depends on dictionary properties.

8. Continuity / single-thread constraints — graph flow & MTZ-like TSP modeling

If physical fabrication demands a single continuous thread that visits pins and goes along chosen segments in sequence, we must add path constraints. Two typical formulations:

8.1 Eulerian path model (allow revisiting edges)

Let the pin set be vertices 
𝑉
V and candidate segments edges 
𝐸
E. Let integer variables 
𝑦
𝑒
∈
𝑍
≥
0
y
e
	​

∈Z
≥0
	​

 denote number of times the thread traverses edge 
𝑒
e. Let 
𝑥
𝑒
∈
{
0
,
1
}
x
e
	​

∈{0,1} indicate whether edge used at least once.

Flow conservation for a single tour (one closed loop): there exists an Eulerian trail if 
∀
𝑣
∀v, degree constraints hold. For directed modeling (if orientation matters), require for each vertex 
𝑣
v:

∑
𝑒
 out of 
𝑣
𝑦
𝑒
=
∑
𝑒
 into 
𝑣
𝑦
𝑒
.
e out of v
∑
	​

y
e
	​

=
e into v
∑
	​

y
e
	​

.

Single tour constraint: the multigraph defined by positive 
𝑦
𝑒
y
e
	​

 is connected and Eulerian (all even degrees for undirected). Enforce degrees parity constraints:

For undirected edges 
𝑒
=
(
𝑢
,
𝑣
)
e=(u,v), degree of vertex 
𝑣
v is 
deg
⁡
(
𝑣
)
=
∑
𝑒
∋
𝑣
𝑦
𝑒
deg(v)=∑
e∋v
	​

y
e
	​

. Require 
deg
⁡
(
𝑣
)
deg(v) even for Eulerian circuit. Enforcing parity in an integer program is possible but tricky; use flow + connectivity constraints.

Objective: minimize 
∥
𝐴
𝑥
−
𝑏
′
∥
2
+
𝛾
∑
𝑒
ℓ
𝑒
𝑦
𝑒
∥Ax−b
′
∥
2
+γ∑
e
	​

ℓ
e
	​

y
e
	​

 subject to 
𝑥
𝑒
=
1
  
⟺
  
𝑦
𝑒
≥
1
x
e
	​

=1⟺y
e
	​

≥1 and parity/connectivity constraints. This becomes a Mixed Integer Program with parity/connectivity constraints.

8.2 Hamiltonian/TSP-like model (visit each pin at most once; choose sequence)

If you force the thread to visit pins in a sequence without repeating (approx TSP), you can model:

Binary variables 
𝑧
𝑢
𝑣
∈
{
0
,
1
}
z
uv
	​

∈{0,1} indicating thread goes directly from pin 
𝑢
u to pin 
𝑣
v (where 
𝑧
𝑢
𝑣
z
uv
	​

 corresponds to selecting edge 
𝑢
𝑣
uv in sequence).

Degree constraints:

∑
𝑣
𝑧
𝑢
𝑣
=
1
∀
𝑢
,
∑
𝑢
𝑧
𝑢
𝑣
=
1
∀
𝑣
v
∑
	​

z
uv
	​

=1∀u,
u
∑
	​

z
uv
	​

=1∀v

(each vertex has one predecessor and successor).

Subtour elimination constraints (Miller–Tucker–Zemlin (MTZ) formulation): introduce ordering variables 
𝑢
𝑣
∈
{
1
,
…
,
∣
𝑉
∣
}
u
v
	​

∈{1,…,∣V∣} and for all 
𝑢
≠
𝑣
u

=v

𝑢
𝑢
−
𝑢
𝑣
+
∣
𝑉
∣
𝑧
𝑢
𝑣
≤
∣
𝑉
∣
−
1.
u
u
	​

−u
v
	​

+∣V∣z
uv
	​

≤∣V∣−1.

Link 
𝑧
𝑢
𝑣
z
uv
	​

 to the image model: if edge 
𝑢
𝑣
uv corresponds to a column 
𝑗
j then 
𝑥
𝑗
=
𝑧
𝑢
𝑣
x
j
	​

=z
uv
	​

 (or 
𝑥
𝑗
≥
𝑧
𝑢
𝑣
x
j
	​

≥z
uv
	​

 if multiple passes allowed). Solve:

min
⁡
𝑧
∈
{
0
,
1
}
∥
𝐴
𝑥
(
𝑧
)
−
𝑏
′
∥
2
+
𝛾
∑
𝑢
𝑣
𝑑
𝑢
𝑣
𝑧
𝑢
𝑣
,
z∈{0,1}
min
	​

∥Ax(z)−b
′
∥
2
+γ
uv
∑
	​

d
uv
	​

z
uv
	​

,

with MTZ constraints. This is a MIP TSP-like model. It is exact but computationally expensive.

These formulations give exact single-thread constraints but are intractable for large 
𝑁
N; heuristics are used in practice.

9. Color images, multi-channel linearization, perceptual transforms
9.1 Multi-channel (RGB) linear model

Let target linear RGB channels be 
𝑏
(
𝑅
)
,
𝑏
(
𝐺
)
,
𝑏
(
𝐵
)
∈
𝑅
𝑚
b
(R)
,b
(G)
,b
(B)
∈R
m
. For monochrome strings (black) with equal effect across channels:

𝑏
^
𝑐
′
=
𝐴
(
𝛼
𝑐
𝑥
)
,
𝑐
∈
{
𝑅
,
𝐺
,
𝐵
}
,
b
^
c
′
	​

=A(α
c
	​

x),c∈{R,G,B},

where 
𝛼
𝑐
α
c
	​

 are per-channel darkness coefficients (often equal). Stack channels into 
𝐵
′
∈
𝑅
𝑚
×
3
B
′
∈R
m×3
 and solve per-channel or jointly via block formulation.

For colored threads, each column has a color vector 
𝑐
(
𝑗
)
∈
𝑅
3
c
(j)
∈R
3
, and the forward model becomes:

𝐵
^
′
=
∑
𝑗
=
1
𝑁
𝑎
(
𝑗
)
(
𝑐
(
𝑗
)
)
⊤
𝑥
𝑗
,
B
^
′
=
j=1
∑
N
	​

a
(j)
(c
(j)
)
⊤
x
j
	​

,

or in matrix notation:

𝐵
^
′
=
𝐴
𝑋
,
B
^
′
=AX,

where 
𝑋
∈
𝑅
𝑁
×
3
X∈R
N×3
 has rows 
𝑥
𝑗
(
𝑐
(
𝑗
)
)
⊤
x
j
	​

(c
(j)
)
⊤
.

9.2 Perceptual transforms

Solve in linear light space: convert sRGB to linear RGB (apply inverse gamma), perform optimization, then convert back. For human perception metrics, use CIELAB and minimize perceptual distance (CIEDE2000), which is nonlinear—approximate via linearization or use multi-scale SSIM as a loss. In equations:

Let 
𝑇
(
⋅
)
T(⋅) be linearization operator: 
𝑏
lin
=
𝑇
(
𝑏
sRGB
)
b
lin
	​

=T(b
sRGB
	​

). Solve for 
𝑥
x minimizing 
∥
𝐴
𝑥
−
(
𝑏
0
1
−
𝑏
lin
)
∥
2
2
∥Ax−(b
0
	​

1−b
lin
	​

)∥
2
2
	​

 or a perceptual loss 
𝐿
(
𝑏
^
,
𝑏
)
L(
b
^
,b).

10. Regularization, constraints and combined objectives

Common objective combines fidelity and regularization:

  
min
⁡
𝑥
∈
𝐶
  
1
2
∥
𝐴
𝑥
−
𝑏
′
∥
2
2
+
𝜆
1
∥
𝑥
∥
1
+
𝜆
2
∥
𝑥
∥
2
2
+
𝛾
 
Length
(
𝑥
)
  
x∈C
min
	​

2
1
	​

∥Ax−b
′
∥
2
2
	​

+λ
1
	​

∥x∥
1
	​

+λ
2
	​

∥x∥
2
2
	​

+γLength(x)
	​


where

𝐶
C encodes constraints (e.g., 
𝑥
≥
0
x≥0, integer constraints),

Length
(
𝑥
)
Length(x) approximates total string length used, e.g.

Length
(
𝑥
)
=
∑
𝑗
ℓ
𝑗
𝑥
𝑗
,
Length(x)=
j
∑
	​

ℓ
j
	​

x
j
	​

,

where 
ℓ
𝑗
ℓ
j
	​

 is physical length of segment 
𝑗
j.

11. Theoretical results & supporting inequalities (statements)

I will state core results that justify greedy or relaxed methods (no full proofs here, but precise inequalities often used):

11.1 Greedy guarantee under coherence

Define dictionary coherence

𝜇
:
=
max
⁡
𝑖
≠
𝑗
∣
𝑎
(
𝑖
)
 
⊤
𝑎
(
𝑗
)
∣
∥
𝑎
(
𝑖
)
∥
2
∥
𝑎
(
𝑗
)
∥
2
.
μ:=
i

=j
max
	​

∥a
(i)
∥
2
	​

∥a
(j)
∥
2
	​

∣a
(i)⊤
a
(j)
∣
	​

.

If the true sparse solution 
𝑥
⋆
x
⋆
 has support size 
𝑠
s with 
𝑠
<
1
2
(
1
+
1
/
𝜇
)
s<
2
1
	​

(1+1/μ), then Orthogonal Matching Pursuit (OMP) recovers the support exactly in noiseless case. (Standard result from sparse approximation.)

11.2 LASSO recovery (RIP condition)

If 
𝐴
A satisfies Restricted Isometry Property (RIP) of order 
2
𝑠
2s with constant 
𝛿
2
𝑠
<
2
−
1
δ
2s
	​

<
2
	​

−1, LASSO recovers an approximation with error bounded proportional to noise level; see compressed sensing literature.

These statements explain when convex relaxations/greedy will succeed.

12. Complexity and practical costs

Building 
𝐴
A: if you enumerate all unordered pin pairs, 
𝑁
=
(
𝑃
2
)
N=(
2
P
	​

) large; for 
𝑃
P pins, 
𝑁
∼
𝑂
(
𝑃
2
)
N∼O(P
2
). Each column costs 
𝑂
(
𝐿
)
O(L) to compute where 
𝐿
L is number of pixels intersected (line length in pixels). So naive cost 
𝑂
(
𝑃
2
𝐿
)
O(P
2
L).

Greedy iteration: per iteration cost 
∑
𝑗
𝑂
(
nnz
(
𝑎
(
𝑗
)
)
)
∑
j
	​

O(nnz(a
(j)
)) if recomputing dot products naively; use caching/acceleration to compute 
𝑎
⊤
𝑟
a
⊤
r fast and only update candidates whose support intersects recently updated pixels.

13. Example algebra: optimal per-line alpha with constraints

If you restrict 
𝛼
∈
[
0
,
𝛼
max
⁡
]
α∈[0,α
max
	​

] due to maximum wraps allowed per segment, choose

𝛼
⋆
=
clip
(
𝑎
⊤
𝑟
𝑎
⊤
𝑎
,
  
0
,
  
𝛼
max
⁡
)
.
α
⋆
=clip(
a
⊤
a
a
⊤
r
	​

,0,α
max
	​

).
14. Continuous (infinite pins) limit & envelope general method

If pins are parametrized by a continuous parameter 
𝑢
u on a boundary curve 
𝐶
(
𝑢
)
C(u) and connection map 
𝑣
=
𝜙
(
𝑢
)
v=ϕ(u) gives a family of chords 
𝐿
𝑢
L
u
	​

 between 
𝐶
(
𝑢
)
C(u) and 
𝐶
(
𝜙
(
𝑢
)
)
C(ϕ(u)), the family is represented by 
𝐹
(
𝑥
,
𝑦
,
𝑢
)
=
0
F(x,y,u)=0 (line equation parameterized by 
𝑢
u). Envelope obtained by solving:

𝐹
(
𝑥
,
𝑦
,
𝑢
)
=
0
,
∂
𝐹
∂
𝑢
(
𝑥
,
𝑦
,
𝑢
)
=
0.
F(x,y,u)=0,
∂u
∂F
	​

(x,y,u)=0.

This yields parametric/implicit equation of the envelope in continuum theory.

15. Practical pipeline (equations recap)

Choose 
𝑃
P pins; enumerate candidate segments 
𝑗
=
1
,
…
,
𝑁
j=1,…,N.

For each 
𝑗
j: compute 
𝑎
(
𝑗
)
a
(j)
 via

(
𝑎
(
𝑗
)
)
𝑖
=
1
∣
𝑃
𝑖
∣
∫
𝑃
𝑖
𝐾
(
𝑑
(
𝑝
,
ℓ
𝑗
)
)
 
1
seg
(
𝑝
)
 
𝑑
𝑝
.
(a
(j)
)
i
	​

=
∣P
i
	​

∣
1
	​

∫
P
i
	​

	​

K(d(p,ℓ
j
	​

))1
seg
	​

(p)dp.

Choose model: additive 
𝐴
𝑥
≈
𝑏
′
Ax≈b
′
 or exponential transform 
𝑦
=
−
ln
⁡
(
𝐼
^
/
𝐼
0
)
≈
𝐴
(
𝛽
⊙
𝑥
)
y=−ln(
I
^
/I
0
	​

)≈A(β⊙x).

Solve

min
⁡
𝑥
∈
𝐶
1
2
∥
𝐴
𝑥
−
𝑏
′
∥
2
2
+
𝜆
1
∥
𝑥
∥
1
+
𝜆
2
∥
𝑥
∥
2
2
+
𝛾
Length
(
𝑥
)
.
x∈C
min
	​

2
1
	​

∥Ax−b
′
∥
2
2
	​

+λ
1
	​

∥x∥
1
	​

+λ
2
	​

∥x∥
2
2
	​

+γLength(x).

possibly with integer/continuity constraints.

If using greedy, iterate:

residual 
𝑟
=
𝑏
′
−
𝐴
𝑥
r=b
′
−Ax,

for each candidate compute score 
𝜌
𝑗
=
(
𝑎
(
𝑗
)
 
⊤
𝑟
)
2
𝑎
(
𝑗
)
 
⊤
𝑎
(
𝑗
)
ρ
j
	​

=
a
(j)⊤
a
(j)
(a
(j)⊤
r)
2
	​

,

choose 
𝑗
⋆
=
arg
⁡
max
⁡
𝑗
𝜌
𝑗
j
⋆
=argmax
j
	​

ρ
j
	​

,

set 
𝛼
⋆
=
max
⁡
(
0
,
𝑎
(
𝑗
⋆
)
 
⊤
𝑟
𝑎
(
𝑗
⋆
)
⊤
𝑎
(
𝑗
⋆
)
)
α
⋆
=max(0,
a
(j
⋆
)⊤
a
(j
⋆
)
a
(j
⋆
)⊤
r
	​

),

update 
𝑥
𝑗
⋆
←
𝑥
𝑗
⋆
+
𝛼
⋆
x
j
⋆
	​

←x
j
⋆
	​

+α
⋆
, 
𝑟
←
𝑟
−
𝛼
⋆
𝑎
(
𝑗
⋆
)
r←r−α
⋆
a
(j
⋆
)
.

Postprocessing: threshold/round, generate continuous tour via heuristics or MIP.

16. Which equations to display in a paper (recommended list)

Column integral definition for 
𝑎
(
𝑗
)
a
(j)
.

Additive forward model 
𝑏
^
′
=
𝐴
𝑥
b
^
′
=Ax.

Exponential model and log transform 
𝑦
=
−
ln
⁡
(
𝐼
/
𝐼
0
)
≈
𝐴
(
𝛽
⊙
𝑥
)
y=−ln(I/I
0
	​

)≈A(β⊙x).

Normal equations 
𝐴
⊤
𝐴
𝑥
=
𝐴
⊤
𝑏
′
A
⊤
Ax=A
⊤
b
′
.

LASSO subgradient 
𝐴
⊤
(
𝐴
𝑥
−
𝑏
′
)
+
𝜆
𝑠
=
0
A
⊤
(Ax−b
′
)+λs=0.

Greedy optimal 
𝛼
⋆
=
𝑎
⊤
𝑟
𝑎
⊤
𝑎
α
⋆
=
a
⊤
a
a
⊤
r
	​

 and 
Δ
=
(
𝑎
⊤
𝑟
)
2
𝑎
⊤
𝑎
Δ=
a
⊤
a
(a
⊤
r)
2
	​

.

Envelope equations 
𝐹
(
𝑥
,
𝑦
,
𝑡
)
=
0
,
 
∂
𝑡
𝐹
=
0
F(x,y,t)=0, ∂
t
	​

F=0 and parabola algebraic steps.

If rectangle `a` collides into rectangle `b`

## Overlap
Check if the two rectangles overlap.

## Relative velocity
Calculate the relative velocity of `a` with respect to `b`.
```a.velocity - b.velocity```

``` rust
for side in a.sides {
  if b.sides.opposite(side).axisAlignedPosition - side.axisAlignedPosition
}
```
For every side of `a`:
  if the opposite side of `b` is 
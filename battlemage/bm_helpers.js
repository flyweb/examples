
/**
 * Vector operations.
 */
const VecOps = {
  /** Calculcate the magnitude of a vector (x, y) */
  mag(x, y) {
    return Math.sqrt(x*x + y*y);
  }
};

/**
 * Array operations.
 */
const ArrayOps = {
  /** Randomize an array's elements. */
  randomize(arr) {
    // Randomize the list.
    let len = arr.length;
    for (let i = 0; i < len - 1; i++) {
      let elem = arr[i];

      // Calculate swap index.
      let fromIdx = i + 1;
      let r = fromIdx + ((Math.random() * (len - fromIdx))|0);

      // Swap.
      arr[i] = arr[r];
      arr[r] = elem;
    }
  }
};

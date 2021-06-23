function fakeWeight() {
  let weight = Math.random() * 10;
  return weight.toFixed(2);
}

// setInterval(() => {
//   console.log("weight ===> ", fakeWeight());
// }, 2000);

module.exports = fakeWeight;

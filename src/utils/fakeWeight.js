function fakeWeight() {
  let weight = Math.random() * 100;
  return weight.toFixed(2).toString() + " KG";
}

// setInterval(() => {
//   console.log("weight ===> ", fakeWeight());
// }, 2000);

module.exports = fakeWeight;

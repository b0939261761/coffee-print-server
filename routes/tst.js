const devices = Array.from(
  { length: 10 },
  (v, i) => ({
    code: `1${(i + 1).toString().padStart(4, '0')}`,
    name: `Устройство: ${i + 1}`
  })
);


console.log(devices);

module.exports = (v1, v2) => {
  if (typeof v1 !== 'string' || typeof v2 !== 'string') return false;
  const [arrV1, arrV2] = [v1.split('.'), v2.split('.')];
  const [lengthV1, lengthV2] = [arrV1.length, arrV2.length];
  const minLength = Math.min(lengthV1, lengthV2);

  for (let i = 0; i < minLength; ++i) {
    const [numV1, numV2] = [parseInt(arrV1[i]), parseInt(arrV2[i])];
    if (numV1 > numV2) return 1;
    if (numV1 < numV2) return -1;
  }

  if (lengthV1 === lengthV2) return 0;
  return lengthV1 < lengthV2 ? -1 : 1;
};

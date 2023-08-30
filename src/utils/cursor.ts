const isCursorInMilliseconds = (elem: HTMLInputElement) =>
  elem.value.lastIndexOf(".") !== -1 &&
  (elem.selectionStart ?? 0) > elem.value.lastIndexOf(".");

const isCursorInMinuttes = (elem: HTMLInputElement) => {
  const numColons = (elem.value.match(/:/g) ?? []).length;
  if (numColons === 0) {
    return false;
  }

  if (numColons === 1) {
    return (elem.selectionStart ?? 0) <= elem.value.indexOf(":");
  }

  if (numColons === 2) {
    return (elem.selectionStart ?? 0) <= elem.value.lastIndexOf(":");
  }
};

const isCursorInHours = (elem: HTMLInputElement) => {
  if ((elem.value.match(/:/g) ?? []).length !== 2) {
    return false;
  }
  return (elem.selectionStart ?? 0) <= elem.value.indexOf(":");
};

export const timeToAddFromCursor = (elem: HTMLInputElement) => {
  if (isCursorInHours(elem)) return "1:00:00";
  if (isCursorInMinuttes(elem)) return "1:00";
  if (isCursorInMilliseconds(elem)) return "0.1";
  return "1";
};

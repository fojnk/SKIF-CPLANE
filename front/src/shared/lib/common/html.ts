/**
 * Вытаскивает rgb из цвета
 */
export const getComputedColor = (color?: string): string | null => {
  if (!color) return null;

  const d = document.createElement('div');
  d.style.color = color;
  document.body.appendChild(d);
  const rgbcolor = window.getComputedStyle(d).color;
  const match =
    /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*\d+[.d+]*)*\)/g.exec(rgbcolor);

  if (!match) return null;

  return `${match[1]}, ${match[2]}, ${match[3]}`;
};

export const checkElementPath = (
  element: HTMLElement | null,
  fn: (element: HTMLElement | null) => boolean,
) => {
  let node = element;

  while (node != null) {
    if (fn(node)) {
      return true;
    } else {
      node = node.parentElement;
    }
  }

  return false;
};

export const checkElementHasParent = (
  element: HTMLElement | null,
  parent: Maybe<HTMLElement>,
) => {
  return checkElementPath(element, (node) => node === parent);
};

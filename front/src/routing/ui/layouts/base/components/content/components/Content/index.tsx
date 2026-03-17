import { FooterItem } from '@gravity-ui/navigation';
import { IconProps } from '@gravity-ui/uikit';
import React, { FC } from 'react';

import ContentAsideItemComponent from '../ContentItem';

export type ContentAsideItem = {
  id?: number | string;
  icon?: IconProps['data'];
  title: string;
  active?: boolean;
  onClick?: (item: ContentAsideItem) => void;
  hidden?: boolean;
  disabled?: boolean;
  checked?: boolean;
  after?: React.ReactNode;
  items?: ContentAsideItem[];
};

export type ContentAsideExtraItem = {
  text: string;
  action: () => void;
  icon?: IconProps['data'];
};

export interface AsideItemsContentProps {
  items?: ContentAsideItem[];
  extraItems?: ContentAsideExtraItem[];
  loading?: boolean;
  deep?: number;
}
const AsideItemsContent: FC<AsideItemsContentProps> = (props) => {
  const { items, loading, deep, extraItems } = props;

  if (!items?.length) {
    return null;
  }

  return (
    <>
      {items.map((item) => {
        return (
          <ContentAsideItemComponent
            key={item.title}
            loading={loading}
            deep={deep}
            item={item}
          />
        );
      })}

      {extraItems &&
        extraItems.map((item) => (
          <FooterItem
            key={item.text}
            compact={false}
            item={{
              id: `${item.text}`,
              title: <div>{item.text}</div>,
              onItemClick: item.action,
              icon: item.icon,
            }}
          />
        ))}
    </>
  );
};

export default AsideItemsContent;

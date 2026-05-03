import { Sliders } from '@gravity-ui/icons';
import { Flex, TextInput } from '@gravity-ui/uikit';
import React, { useEffect, useMemo, useRef } from 'react';

import {
  SFLayoutAside,
  SfListMessage,
} from '@/modules/control-plane/shared/layout';
import {
  DataItem,
  DataItemSkeleton,
  ExperimentStatus,
} from '@/modules/control-plane/shared/ui';
import { useValue } from '@/shared/lib/react/hooks/use-value';
import { AppIcon } from '@/shared/ui/app-icon';
import { Button } from '@/shared/ui/button';

interface DataList {
  name?: string;
  id?: number;
  description?: string;
  status?: string;
}

interface SfAsideListProps {
  data: DataList[] | null;
  selected: number | null;
  onCreateClick?: () => void;
  onItemClick: (id: number | null) => void;
  loading?: boolean;
  failed?: boolean;
  title: string;
  createText?: string;
  hasFilter?: boolean;
  level2?: boolean;
  ignoreSelected?: boolean;
  experimentStatuses?: boolean;
  resizable?: {
    resizableRight?: boolean;
    resizableLeft?: boolean;
    maxWidth?: number;
    minWidth?: number;
    canCollapse?: boolean;
    pageId?: string;
  };
}

export const SfAsideList = ({
  data,
  onCreateClick,
  selected,
  onItemClick,
  loading,
  failed,
  title,
  hasFilter,
  createText = 'New',
  level2 = false,
  ignoreSelected = true,
  resizable,
  experimentStatuses,
}: SfAsideListProps) => {
  const selectedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [data]);

  const search = useValue('');
  const showFilter = useValue<boolean>(false);

  const filtered = useMemo(() => {
    if (data === null) return [];
    if (!search.value) return data;

    const searchText = search.value.toLowerCase();

    return data.filter((item) => {
      return item.name?.toLowerCase().includes(searchText);
    });
  }, [data, search.value]);

  const filter = (
    <TextInput
      autoFocus
      size="m"
      placeholder="Search..."
      onChange={(e) => search.set(e.target.value)}
      hasClear
    />
  );
  return (
    <SFLayoutAside
      level2={level2}
      title={title}
      button={
        <Flex direction="row" gapRow={1}>
          {onCreateClick && (
            <Button onClick={onCreateClick} view="glass" size="m">
              <Button.Icon>
                <AppIcon.ActionAdd />
              </Button.Icon>
              {createText}
            </Button>
          )}
          {hasFilter && (
            <Button
              onClick={() => {
                showFilter.set(!showFilter.value);
                if (showFilter.value) {
                  search.set('');
                }
              }}
              view={showFilter.value ? 'flat-action' : 'flat-secondary'}
              size="s"
            >
              <Button.Icon>
                <Sliders />
              </Button.Icon>
            </Button>
          )}
        </Flex>
      }
      showFilter={showFilter.value}
      filter={filter}
      resizable={resizable}
    >
      {loading ? (
        <DataItemSkeleton />
      ) : (
        <Flex direction="column" gapRow={2} style={{ paddingBottom: '40px' }}>
          {filtered.length > 0 ? (
            filtered.map((item) => {
              return (
                <div
                  ref={item.id! === selected ? selectedRef : null}
                  key={item.id}
                >
                  <DataItem
                    title={item.name ? item.name : 'noname'}
                    selected={item.id! === selected}
                    id={item.id!}
                    onClick={() => {
                      if (selected === item.id && ignoreSelected) return;
                      onItemClick(item.id!);
                    }}
                    status={
                      experimentStatuses ? (
                        <ExperimentStatus status={item.status ?? undefined} />
                      ) : undefined
                    }
                  />
                </div>
              );
            })
          ) : (
            <SfListMessage>
              {failed
                ? 'Data loading error, please refresh the page.'
                : search.value && search.value.length > 0
                  ? 'Search has no results'
                  : 'The list is empty.'}
            </SfListMessage>
          )}
        </Flex>
      )}
    </SFLayoutAside>
  );
};

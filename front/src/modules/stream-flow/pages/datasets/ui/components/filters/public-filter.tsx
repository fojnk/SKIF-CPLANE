import { SegmentedRadioGroup } from '@gravity-ui/uikit';
import React from 'react';

import { DsCatalogFilter } from '@/modules/stream-flow/shared/types';

interface Props {
    filter: DsCatalogFilter;
    setFilter: (filter: DsCatalogFilter) => void;
}

export const PublicFilter = ({ filter, setFilter }: Props) => {
    const items = [
        { value: 'all', content: 'Все' },
        { value: 'public', content: 'Публичные' },
        { value: 'private', content: 'Приватные' },
    ];

    const selected = React.useMemo(() => {
        if (filter.public === true) return 'public';
        if (filter.public === false) return 'private';
        return 'all';
    }, [filter.public]);

    const handleUpdate = (next: string) => {
        const nextPublic = next === 'all' ? undefined : next === 'public';
        setFilter({ ...filter, public: nextPublic, offset: 0 });
    };

    return (
        <SegmentedRadioGroup size="l" value={selected} onUpdate={handleUpdate}>
            {items.map((item) => (
                <SegmentedRadioGroup.Option key={item.value} value={item.value} content={item.content} />
            ))}
        </SegmentedRadioGroup>
    );
};



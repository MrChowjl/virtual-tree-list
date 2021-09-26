import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import { VerticalAlignMiddleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ColumnResizeHandler from './ColumnResizeHandler';
import { useUpdateEffect, useClassNames } from './utils';
import Cell, { InnerCellProps } from './Cell';

export interface HeaderCellProps extends InnerCellProps {
  index?: number;
  minWidth?: number;
  sortColumn?: string;
  sortType?: 'descend' | 'ascend';
  sortable?: boolean;
  resizable?: boolean;
  groupHeader?: boolean;
  flexGrow?: number;
  fixed?: boolean | 'left' | 'right';
  children: React.ReactNode;
  onResize?: (columnWidth?: number, dataKey?: string) => void;
  onSortColumn?: (dataKey?: string) => void;
  onColumnResizeStart?: (columnWidth?: number, left?: number, fixed?: boolean) => void;
  onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: boolean) => void;
  onColumnResizeEnd?: (
    columnWidth?: number,
    cursorDelta?: number,
    dataKey?: any,
    index?: number
  ) => void;
}

const SORTED_ICON = {
  descend: <ArrowDownOutlined />,
  ascend: <ArrowUpOutlined />
};

const HeaderCell = React.forwardRef((props: HeaderCellProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    className,
    classPrefix,
    width,
    dataKey,
    headerHeight,
    children,
    left,
    sortable,
    sortColumn,
    sortType,
    groupHeader,
    resizable,
    fixed,
    minWidth,
    index,
    flexGrow,
    onColumnResizeEnd,
    onResize,
    onColumnResizeStart,
    onColumnResizeMove,
    onSortColumn,
    ...rest
  } = props;

  const [columnWidth, setColumnWidth] = useState(isNil(flexGrow) ? width : 0);

  useUpdateEffect(() => {
    setColumnWidth(isNil(flexGrow) ? width : 0);
  }, [flexGrow, width]);

  const { withClassPrefix, merge, prefix } = useClassNames(classPrefix);
  const classes = merge(className, withClassPrefix({ sortable }));

  let ariaSort;

  if (sortColumn === dataKey) {
    ariaSort = 'other';
    if (sortType === 'ascend') {
      ariaSort = 'ascending';
    } else if (sortType === 'descend') {
      ariaSort = 'descending';
    }
  }

  const handleClick = useCallback(() => {
    if (sortable) {
      onSortColumn?.(dataKey);
    }
  }, [dataKey, onSortColumn, sortable]);

  const handleColumnResizeStart = useCallback(() => {
    onColumnResizeStart?.(columnWidth, left, !!fixed);
  }, [columnWidth, fixed, left, onColumnResizeStart]);

  const handleColumnResizeEnd = useCallback(
    (nextColumnWidth: number, cursorDelta?: number) => {
      setColumnWidth(nextColumnWidth);
      onColumnResizeEnd?.(nextColumnWidth, cursorDelta, dataKey, index);
      onResize?.(nextColumnWidth, dataKey);
    },
    [dataKey, index, onColumnResizeEnd, onResize]
  );

  const renderSortColumn = () => {
    if (sortable && !groupHeader) {
      const SortIcon = sortColumn === dataKey && sortType ? SORTED_ICON[sortType] : <VerticalAlignMiddleOutlined />;
      return (
        <span className={prefix('sort-wrapper')}>
          {SortIcon}
        </span>
      );
    }
    return null;
  };

  return (
    <div ref={ref} className={classes}>
      <Cell
        aria-sort={ariaSort}
        {...rest}
        width={width}
        dataKey={dataKey}
        left={left}
        headerHeight={headerHeight}
        isHeaderCell={true}
        onClick={!groupHeader ? handleClick : null}
      >
        {children}
        {renderSortColumn()}
      </Cell>

      {resizable ? (
        <ColumnResizeHandler
          defaultColumnWidth={columnWidth}
          key={columnWidth}
          columnLeft={left}
          columnFixed={fixed}
          height={headerHeight ? headerHeight - 1 : undefined}
          minWidth={minWidth}
          onColumnResizeMove={onColumnResizeMove}
          onColumnResizeStart={handleColumnResizeStart}
          onColumnResizeEnd={handleColumnResizeEnd}
        />
      ) : null}
    </div>
  );
});

HeaderCell.displayName = 'HeaderCell';
HeaderCell.defaultProps = {
  classPrefix: 'cell-header'
};
HeaderCell.propTypes = {
  index: PropTypes.number,
  sortColumn: PropTypes.string,
  sortType: PropTypes.oneOf(['descend', 'ascend']),
  sortable: PropTypes.bool,
  resizable: PropTypes.bool,
  minWidth: PropTypes.number,
  onColumnResizeStart: PropTypes.func,
  onColumnResizeEnd: PropTypes.func,
  onResize: PropTypes.func,
  onColumnResizeMove: PropTypes.func,
  onSortColumn: PropTypes.func,
  flexGrow: PropTypes.number,
  fixed: PropTypes.any,
  children: PropTypes.node
};

export default HeaderCell;

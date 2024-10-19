import React from 'react';
import { Pagination } from '@mantine/core';

const CustomPagination = ({ total, page, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);

  return (
    <Pagination
      total={totalPages}
      page={page}
      onChange={onPageChange}
      siblings={1}
      boundaries={2}
    />
  );
};

export default CustomPagination;

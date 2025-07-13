import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import { Table, Button, Form, Collapse, Pagination } from "react-bootstrap";
import { FaTrash, FaFilter } from "react-icons/fa";
import "./Table.css"; // Custom CSS for modern design

// Utility Functions (unchanged)
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// Enhanced Table Head Component (unchanged)
function EnhancedTableHead({
  headers,
  order,
  orderBy,
  onSelectAllClick,
  onRequestSort,
  numSelected,
  rowCount,
  showSelectColumn,
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <thead className="table-header">
      <tr>
        {showSelectColumn && (
          <th>
            <input
              type="checkbox"
              className="select-checkbox"
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              aria-label="select all"
            />
          </th>
        )}
        {headers.map((headCell) => (
          <th
            key={headCell.id}
            onClick={createSortHandler(headCell.id)}
            className="sortable-column"
          >
            {headCell.label}
            {orderBy === headCell.id ? (
              <span className="visually-hidden">
                {order === "desc" ? "sorted descending" : "sorted ascending"}
              </span>
            ) : null}
          </th>
        ))}
      </tr>
    </thead>
  );
}

EnhancedTableHead.propTypes = {
  headers: PropTypes.array.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  showSelectColumn: PropTypes.bool,
};

// Enhanced Table Toolbar Component (unchanged)
function EnhancedTableToolbar({
  numSelected,
  title,
  showSubmitButton,
  submitButtonText,
  onSubmit,
}) {
  return (
    <div className="table-toolbar">
      <h2>{numSelected > 0 ? `${numSelected} selected` : title}</h2>
      <div>
        {showSubmitButton && numSelected > 0 && (
          <Button
            variant="outline-primary"
            className="submit-btn"
            onClick={onSubmit}
          >
            {submitButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  showSubmitButton: PropTypes.bool,
  submitButtonText: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

// Enhanced Table Component (updated)
const EnhancedTable = ({
  title,
  headers,
  rows,
  showSubmitButton = true,
  submitButtonText = "Submit",
  onSubmit,
  maxRows = 20,
  onRowSelect,
  onSelectAll,
  showSelectColumn = true,
  rowsPerPage = 10,
}) => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(headers[0].id);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.id);
      setSelected(newSelected);
      if (onSelectAll) {
        onSelectAll(newSelected);
      }
    } else {
      setSelected([]);
      if (onSelectAll) {
        onSelectAll([]);
      }
    }
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);

    if (onRowSelect) {
      onRowSelect(id);
    }
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const visibleRows = useMemo(() => {
    const filteredRows = rows.filter((row) =>
      headers.some(
        (header) =>
          row[header.id] &&
          row[header.id]
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    );
    return stableSort(filteredRows, getComparator(order, orderBy));
  }, [order, orderBy, rows, searchTerm, headers]);

  const totalPages = Math.ceil(visibleRows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = visibleRows.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="enhanced-table-container">
      <EnhancedTableToolbar
        numSelected={selected.length}
        title={title}
        showSubmitButton={showSubmitButton}
        submitButtonText={submitButtonText}
        onSubmit={onSubmit}
      />
      <Form.Control
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3"
      />
      <div
        className="table-responsive"
        style={{
          maxHeight: `${maxRows * 35}px`,
          overflowY: "auto",
          borderRadius: "10px",
        }}
      >
        <Table striped bordered hover className="enhanced-table">
          <EnhancedTableHead
            headers={headers}
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
            showSelectColumn={showSelectColumn}
          />
          <tbody>
            {paginatedRows.map((row, index) => {
              const isItemSelected = isSelected(row.id);
              const labelId = `enhanced-table-checkbox-${index}`;
              const isBelowMinCapacity =
                Number(row.curr_enrolled) < Number(row.min_capacity);

              return (
                <React.Fragment key={row.id}>
                  <tr
                    onClick={() => toggleRowExpansion(row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    className={`${isItemSelected ? "table-active" : ""} ${
                      isBelowMinCapacity
                        ? "below-min-capacity"
                        : Number(row.curr_enrolled) >= Number(row.min_capacity)
                        ? "above-min-capacity"
                        : ""
                    }`}
                  >
                    {showSelectColumn && (
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className="select-checkbox"
                          checked={isItemSelected}
                          aria-labelledby={labelId}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleClick(e, row.id)}
                        />
                      </td>
                    )}
                    {headers.map((header) => (
                      <td
                        key={header.id}
                        align={
                          header.id === "action" || header.id === "actions"
                            ? "center"
                            : header.numeric
                            ? "right"
                            : "left"
                        }
                      >
                        {Array.isArray(row[header.id])
                          ? `${row[header.id].length} items`
                          : row[header.id]}
                      </td>
                    ))}
                  </tr>
                  <tr className="expanded-row">
                    <td colSpan={headers.length + (showSelectColumn ? 1 : 0)}>
                      <Collapse in={expandedRows[row.id]}>
                        <div>
                          {headers.map((header) =>
                            Array.isArray(row[header.id]) ? (
                              <div key={header.id}>
                                <strong>{header.label}:</strong>
                                <ul>
                                  {row[header.id].map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null
                          )}
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>
      </div>
      {/* Pagination Controls */}
      <div className="d-flex justify-content-center mt-3">
        <Pagination className="custom-pagination">
          <Pagination.Prev
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    </div>
  );
};

EnhancedTable.propTypes = {
  title: PropTypes.string.isRequired,
  onRowSelect: PropTypes.func,
  onSelectAll: PropTypes.func,
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      numeric: PropTypes.bool,
      disablePadding: PropTypes.bool,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    })
  ).isRequired,
  showSubmitButton: PropTypes.bool,
  submitButtonText: PropTypes.string,
  showSelectColumn: PropTypes.bool,
  rowsPerPage: PropTypes.number,
};

export default EnhancedTable;

import React from 'react';
import { useState } from 'react';
import { TextField, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { styled } from "@mui/material/styles";
import { useNavigate } from 'react-router';

function CoursesTable({ coursesData }) {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const filteredCourses = coursesData.filter(
        c =>
            c.course.toLowerCase().includes(search.toLowerCase()) ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.term.toLowerCase().includes(search.toLowerCase())
    );

    function termComparator(a: string, b: string) {
        const parseTerm = (term: string) => {
            const [season, yearStr] = term.split(' ');
            const year = parseInt(yearStr, 10);
            const seasonOrder: Record<string, number> = {
                'Spring': 1,
                'Summer': 2,
                'Fall': 3,
            };
            return { year, seasonSortOrder: seasonOrder[season] ?? 99 };
        };

        const ta = parseTerm(a);
        const tb = parseTerm(b);

        if (ta.year !== tb.year) {
            return ta.year - tb.year;
        }
        return ta.seasonSortOrder - tb.seasonSortOrder;
    }

    const columns = [
        {
            field: 'course',
            headerName: 'Course',
            flex: 1,
            headerClassName: 'column-header',
            renderCell: (params) => (
                <span
                    style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => navigate(`/courses/${params.row.id}`)}
                >
                    {params.value}
                </span>
            ),
        },
        { field: 'name', headerName: 'Name', flex: 2, headerClassName: 'column-header' },
        {
            field: 'term',
            headerName: 'Term',
            flex: 1,
            headerClassName: 'column-header',
            sortComparator: termComparator,
        },
    ];

    const rows = filteredCourses.map((row) => ({
        id: row.id,
        ...row,
    }));

    const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
        '& .column-header': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontWeight: 'bold',
        },
    }));

    return (
        <Box sx={{ mb: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <TextField
                    label="Search"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </Box>
            <div style={{ width: '100%' }}>
                <StyledDataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    disableRowSelectionOnClick
                />
            </div>
        </Box>
    );
}

function Courses() {
    const coursesData = [
        { id: 1, course: 'CS 61A', name: 'Structure and Interpretation of Computer Programs', term: 'Fall 2025' },
        { id: 2, course: 'DATA C88C', name: 'Computational Structures in Data Science', term: 'Spring 2025' },
        { id: 3, course: 'CS 61B', name: 'Data Structures', term: 'Fall 2023' },
    ];

  return (
    <div style={{paddingLeft: '1rem', paddingRight: '1rem'}}>
        <h1>Courses</h1>
        <CoursesTable coursesData={coursesData} />
    </div>
  );
}

export default Courses;

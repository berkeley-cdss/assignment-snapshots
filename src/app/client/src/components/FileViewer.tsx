import React from 'react';

import { Typography, Paper } from '@mui/material';
import { CodeBlock, a11yDark } from 'react-code-blocks'; // TODO make theme configurable? a11yDark, a11yLight

function FileViewer({ code, language }) {
    return (
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 1 }}>
          <Typography variant="body2" component="pre" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            <div
                style={{
                    fontFamily: 'Menlo',
                }}
            >
              <CodeBlock text={code} language={language} theme={a11yDark} showLineNumbers={true} wrapLongLines={false} />
            </div>
          </Typography>
        </Paper>
    );
}

export default FileViewer;

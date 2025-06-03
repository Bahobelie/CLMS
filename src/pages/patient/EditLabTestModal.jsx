import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Typography,
  Box,
  Divider,
  ListSubheader,
  Select,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  Checkbox,
  FormControlLabel,
  IconButton,
  Chip
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess, ExpandMore } from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

const EditLabTestModal = ({
                            open,
                            onClose,
                            test,
                            onSave,
                            apiUrl,
                            patient,
                            record,
                            disabled = false
                          }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    patientid: patient?.id || '',
    patienthistoryid: record?.id || '',
    code: '',
    name: '',
    description: '',
    price: 0,
    status: 'pending',
    result: '',
    referencerange: '',
    remark: '',
    isactive: true,
    sampleType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testOptions, setTestOptions] = useState([]);
  const [selectedTestDetails, setSelectedTestDetails] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedTests, setSelectedTests] = useState([]);
  const [initialReferenceRange,setInitialReferenceRange] = useState(null); // store once

  // Initialize form data when modal opens
  useEffect(() => {
    if (!open) return;

    const fetchFormInitData = async () => {
      setError(null);
      setLoading(true);
      try {
        const [templateRes, codeRes] = await Promise.all([
          axios.get(`${apiUrl}/systemconstants/by-condition`, { params: { type: 'LabTest' } }),
          axios.get(`${apiUrl}/model/next-code`, { params: { model: 'LabTest', prefix: 'LT-' } }),
        ]);

        const tests = templateRes.data;
        setTestOptions(tests);
        const generatedCode = codeRes.data.code;

        // Initialize form data
        let initialData = {
          patientid: patient.id,
          patienthistoryid: record.id,
          code: generatedCode,
          name: '',
          description: '',
          price: 0,
          status: 'pending',
          result: '',
          referencerange: '',
          remark: '',
          isactive: true,
          sampleType: test?.sampleType || '',
        };

        if (test) {
          const selectedTemplate = tests.find(t => t.id === test.templateId) || {};
          setSelectedTestDetails(selectedTemplate);
          setSelectedTests(test.templateId ? [test.templateId] : []);

          initialData = {
            ...initialData,
            code: test.code || generatedCode,
            name: test.name || selectedTemplate.name || '',
            description: test.description || selectedTemplate.description || '',
            price: test.price || selectedTemplate.amount || 0,
            status: test.status || 'pending',
            result: test.result || '',
            referencerange: test.referencerange || selectedTemplate.referencerange || '',
            remark: test.remark || '',
            sampleType: test.sampleType || '',
          };
        }

        setFormData(initialData);
        setInitialReferenceRange(formData.referencerange);
        setIsInitialized(true);
      } catch (err) {
        console.error('Initialization Error:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    const getLabTest=async ()=>{
      try {
        const labtest = await axios.get(`${apiUrl}/systemconstants/by-condition`, { params: { name: test.name } });
          setInitialReferenceRange(labtest.data[0].referencerange);
      }
      catch(err) {
        console.error('Error:', err);
      }
    }
    fetchFormInitData();
    getLabTest();
    return () => {
      setIsInitialized(false);
      setSelectedTests([]);
      setExpandedCategories({});
    };
  }, [open, test, apiUrl, patient?.id, record?.id,initialReferenceRange]);

  // Group tests by category
  const labTestGroups = useMemo(() => {
    const groups = {};
    const parentTests = testOptions.filter(test => test.parentId === null);

    parentTests.forEach(parent => {
      const children = testOptions.filter(test => test.parentId === parent.index);
      groups[parent.id] = {
        parent,
        children: children.map(child => ({
          ...child,
          grandchildren: testOptions.filter(test => test.parentId === child.index)
        }))
      };
    });

    return groups;
  }, [testOptions]);

  // Handle category expansion toggle
  const handleCategoryToggle = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Check if all tests in a child category are selected
  const isChildAllSelected = (childId) => {
    const child = testOptions.find(t => t.id === childId);
    if (!child) return false;

    const grandchildren = testOptions.filter(t => t.parentId === child.index);
    if (grandchildren.length === 0) return selectedTests.includes(childId);

    return grandchildren.every(test => selectedTests.includes(test.id));
  };

  // Check if some tests in a child category are selected
  const isChildSomeSelected = (childId) => {
    const child = testOptions.find(t => t.id === childId);
    if (!child) return false;

    const grandchildren = testOptions.filter(t => t.parentId === child.index);
    if (grandchildren.length === 0) return false;

    return grandchildren.some(test => selectedTests.includes(test.id)) &&
      !grandchildren.every(test => selectedTests.includes(test.id));
  };

  // Handle child category selection
  const handleChildSelect = (childId, isSelected) => {
    const child = testOptions.find(t => t.id === childId);
    if (!child) return;

    const grandchildren = testOptions.filter(t => t.parentId === child.index);

    if (grandchildren.length > 0) {
      const grandchildIds = grandchildren.map(t => t.id);
      setSelectedTests(prev =>
        isSelected
          ? [...new Set([...prev, ...grandchildIds])]
          : prev.filter(id => !grandchildIds.includes(id))
      );
    } else {
      setSelectedTests(prev =>
        isSelected
          ? [...prev, childId]
          : prev.filter(id => id !== childId)
      );
    }

    // If selecting, also select the child test template
    if (isSelected && child) {
      setSelectedTestDetails(child);
      setFormData(prev => ({
        ...prev,
        name: child.name,
        description: child.description,
        price: child.amount || 0,
        referencerange: child.referencerange || '',
        sampleType: child.sampleType || prev.sampleType,
      }));
    }
  };

  // Handle individual test selection
  const handleTestSelect = (testId, isSelected) => {
    setSelectedTests(prev =>
      isSelected
        ? [...prev, testId]
        : prev.filter(id => id !== testId)
    );

    // If selecting, update form with test details
    if (isSelected) {
      const selectedTest = testOptions.find(t => t.id === testId);
      if (selectedTest) {
        setSelectedTestDetails(selectedTest);
        setFormData(prev => ({
          ...prev,
          name: selectedTest.name,
          description: selectedTest.description,
          price: selectedTest.amount || 0,
          referencerange: selectedTest.referencerange || '',
          sampleType: selectedTest.sampleType || prev.sampleType,
        }));
      }
    }
  };

  const handleChange = (e) => {
    if (disabled) return;
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (disabled) return;
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name) {
        throw new Error('Test name is required');
      }

      const payload = {
        ...formData,
        templateId: selectedTestDetails?.id || null
      };

      if (test && test.id) {
        await axios.put(`${apiUrl}/labTests/${test.id}`, payload);
      } else {
        await axios.post(`${apiUrl}/labTests`, payload);
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Submit Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save test.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{
        textAlign: 'center',
        color: theme.palette.primary[100],
        py: 2
      }}>
        {test ? 'Edit Lab Test' : 'Add New Lab Test'}
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Box sx={{
          opacity: disabled ? 0.7 : 1,
          '& .Mui-disabled': {
            color: 'inherit',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.23)'
            }
          }
        }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : isInitialized ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Test Template
                </Typography>
                <Box
                  sx={{
                    border: '1px solid rgba(0, 0, 0, 0.23)',
                    borderRadius: 1,
                    p: 1,
                    maxHeight: 400,
                    overflow: 'auto'
                  }}
                >
                  {Object.keys(labTestGroups).length > 0 ? (
                    <List
                      sx={{
                        width: '100%',
                        bgcolor: 'background.paper',
                        '& ul': { padding: 0 },
                      }}
                      subheader={<li />}
                    >
                      {Object.entries(labTestGroups).map(([parentId, group]) => (
                        <li key={parentId}>
                          <ul>
                            <ListSubheader sx={{ bgcolor: 'background.paper', p: 0 }}>
                              <Accordion
                                expanded={expandedCategories[parentId] || false}
                                onChange={() => handleCategoryToggle(parentId)}
                                sx={{ boxShadow: 'none' }}
                              >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography fontWeight="bold">
                                    {group.parent.name}
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ pl: 0, pr: 0 }}>
                                  <List dense>
                                    {group.children.map((child) => (
                                      <React.Fragment key={child.id}>
                                        <ListItem
                                          sx={{ pl: 4 }}
                                          secondaryAction={
                                            child.grandchildren.length > 0 && (
                                              <IconButton
                                                edge="end"
                                                onClick={() => handleCategoryToggle(child.id)}
                                              >
                                                {expandedCategories[child.id] ? <ExpandLess /> : <ExpandMore />}
                                              </IconButton>
                                            )
                                          }
                                        >
                                          <FormControlLabel
                                            control={
                                              <Checkbox
                                                checked={isChildAllSelected(child.id)}
                                                indeterminate={isChildSomeSelected(child.id)}
                                                onChange={(e) => handleChildSelect(child.id, e.target.checked)}
                                                sx={{
                                                  color: theme.palette.primary.main,
                                                  '&.Mui-checked': {
                                                    color: theme.palette.primary.main,
                                                  },
                                                }}
                                              />
                                            }
                                            label={child.name}
                                          />
                                        </ListItem>

                                        {child.grandchildren.length > 0 && (
                                          <Collapse in={expandedCategories[child.id]} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                              {child.grandchildren.map((grandchild) => (
                                                <ListItem key={grandchild.id} sx={{ pl: 8 }}>
                                                  <FormControlLabel
                                                    control={
                                                      <Checkbox
                                                        checked={selectedTests.includes(grandchild.id)}
                                                        onChange={(e) => handleTestSelect(grandchild.id, e.target.checked)}
                                                        sx={{
                                                          color: theme.palette.primary.main,
                                                          '&.Mui-checked': {
                                                            color: theme.palette.primary.main,
                                                          },
                                                        }}
                                                      />
                                                    }
                                                    label={
                                                      <Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                          {grandchild.name}
                                                        </Typography>
                                                        {grandchild.referencerange && (
                                                          <Typography variant="caption" color="text.secondary" display="block">
                                                            Ref: {grandchild.referencerange}
                                                          </Typography>
                                                        )}
                                                      </Box>
                                                    }
                                                  />
                                                </ListItem>
                                              ))}
                                            </List>
                                          </Collapse>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </List>
                                </AccordionDetails>
                              </Accordion>
                            </ListSubheader>
                          </ul>
                        </li>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary">No test templates available</Typography>
                  )}
                </Box>
                <Typography color="info.main" sx={{ fontWeight: 500, mt: 2 }}>
                  ℹ️ At a time, only one sample should be selected
                </Typography>



                {selectedTests.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Selected Tests:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {selectedTests.map(testId => {
                        const test = testOptions.find(t => t.id === testId);
                        return test ? (
                          <Chip
                            key={testId}
                            label={test.name}
                            onDelete={() => handleTestSelect(testId, false)}
                            color="primary"
                            size="small"
                          />
                        ) : null;
                      })}
                    </Box>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Test Code"
                  name="code"
                  fullWidth
                  value={formData.code}
                  onChange={handleChange}
                  disabled
                  variant="filled"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Test Name"
                  name="name"
                  fullWidth
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={disabled}
                  error={!formData.name}
                  helperText={!formData.name ? 'Test name is required' : ''}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  disabled={disabled}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Price"
                  name="price"
                  fullWidth
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  required
                  disabled={disabled}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={disabled}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={disabled}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="complete">Complete</MenuItem>
                    <MenuItem value="canceled">Canceled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>


              <Grid item xs={12} md={6}>
                <TextField
                  label="Reference Range"
                  name="referencerange"
                  fullWidth
                  value={formData.referencerange}
                  onChange={handleChange}
                  disabled={disabled}
                />

                {/* Show chips below the text field */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mt: 1, flexWrap: 'wrap' }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Reference Range:
                  </Typography>
                  <Chip
                    label={initialReferenceRange || "N/A"}
                    color="primary"
                    variant="outlined"
                    sx={{ height: 32, fontSize: 14 }}
                  />
                </Stack>

              </Grid>


              <Grid item xs={12} md={6}>
                <TextField
                  label="Result"
                  name="result"
                  fullWidth
                  value={formData.result}
                  onChange={handleChange}
                  disabled={disabled}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Remark"
                  name="remark"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.remark}
                  onChange={handleChange}
                  disabled={disabled}
                />
              </Grid>
            </Grid>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          color="secondary"
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={loading || disabled || !formData.name}
          variant="contained"
        >
          {loading ? <CircularProgress size={24} /> : test ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditLabTestModal;
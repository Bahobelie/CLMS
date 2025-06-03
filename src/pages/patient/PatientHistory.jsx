import React, { useEffect, useState, useMemo } from 'react';
import {
  Grid, TextField, Button, Typography, MenuItem, Tabs, Tab,
  Select, InputLabel, FormControl, Box, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Divider,
  Accordion, AccordionSummary, AccordionDetails, Checkbox,
  FormControlLabel, List, ListItem, Collapse, ListItemText,
  ListSubheader, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Formik, Form, Field } from 'formik';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const PatientHistory = ({ open, onClose, initialData, handelSubmite, userRole }) => {
  const theme = useTheme();
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  // State management
  const [tabIndex, setTabIndex] = useState(0);
  const [labtest, setLabtest] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedTests, setSelectedTests] = useState([]);
  const [testRemarks, setTestRemarks] = useState({});

  const handleTestRemarkChange = (testId, remark) => {
    setTestRemarks(prev => ({
      ...prev,
      [testId]: remark
    }));
  };

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  const categorizedFields = {
    healthInfo: [
      { label: 'Symptoms', name: 'chief_complaint_symptoms' },
      { label: 'Duration', name: 'chief_complaint_duration' },
      {
        label: 'Pain Severity (1-10)',
        name: 'current_symptoms_pain_severity',
        type: 'number',
        inputProps: {
          min: 1,
          max: 10
        },
      },
      { label: 'Assessment', name: 'assessment', type: 'textarea' },
      { label: 'Complaint', name: 'medical_history_conditions' },
      { label: 'Medications', name: 'medical_history_medications' },
      { label: 'Surgeries', name: 'medical_history_surgeries' },
      { label: 'History', name: 'medical_history_hospitalizations' },
      { label: 'Pain Location', name: 'current_symptoms_pain_location' },
      { label: 'Other Symptoms', name: 'current_symptoms_other_symptoms' },
    ],
    lifestyle: [
      { label: 'Allergies', name: 'allergies' },
      { label: 'Chronic Diseases', name: 'family_history_chronic_diseases' },
      { label: 'Genetic Conditions', name: 'family_history_genetic_conditions' },
      {
        label: 'Smoking',
        name: 'lifestyle_smoking',
        type: 'boolean'
      },
      {
        label: 'Alcohol',
        name: 'lifestyle_alcohol',
        type: 'boolean'
      },
      {
        label: 'Drugs',
        name: 'lifestyle_drugs',
        type: 'boolean'
      },
      { label: 'Diet', name: 'lifestyle_diet' },
      { label: 'Exercise', name: 'lifestyle_exercise' },
    ],
    vitalsAndExam: [
      { label: 'BP', name: 'patient_current_info_bp' },
      { label: 'PR', name: 'patient_current_info_pr' },
      { label: 'RR', name: 'patient_current_info_rr' },
      { label: 'Oxygen Saturation', name: 'patient_current_info_oxygen_saturation' },
      { label: 'Temperature', name: 'patient_current_info_temp' },
      { label: 'Weight', name: 'patient_current_info_weight' },
      { label: 'Height', name: 'patient_current_info_height' },
      { label: 'HEENT', name: 'patient_current_info_heent' },
      { label: 'LGS', name: 'patient_current_info_lgs' },
      { label: 'RS', name: 'patient_current_info_rs' },
      { label: 'CVS', name: 'patient_current_info_cvs' },
      { label: 'GIS', name: 'patient_current_info_gis' },
      { label: 'GUS', name: 'patient_current_info_gus' },
      { label: 'IS', name: 'patient_current_info_is' },
      { label: 'MSS', name: 'patient_current_info_mss' },
      { label: 'CNS', name: 'patient_current_info_cns' },
    ],
    other: [
      { label: 'Previous Doctors', name: 'previous_treatments_previous_doctors' },
      { label: 'Medications Taken', name: 'previous_treatments_medications_taken' },
      { label: 'Current Doctor', name: 'current_treatments_current_doctor' },
      { label: 'Current Medications', name: 'current_treatments_current_medications' },
      { label: 'Immunizations Up to Date', name: 'immunizations_up_to_date', type: 'boolean' },
      { label: 'Recent Vaccines', name: 'immunizations_recent_vaccines' },
      { label: 'Description', name: 'description' },
    ]
  };

  useEffect(() => {
    const fetchLabTest = async () => {
      try {
        const response = await axios.get(`${apiUrl}/systemConstants/by-condition`, {
          params: {
            type: "LabTest"
          }
        });
        if (response.status === 200) {
          setLabtest(response.data);
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchLabTest();
  }, [apiUrl]);

  // Initialize selected tests and expanded categories when initialData changes
  useEffect(() => {
    if (initialData?.selectedLabTests) {
      setSelectedTests(initialData.selectedLabTests.map(test => test.id));

      // Expand categories that contain selected tests
      const newExpanded = {};
      initialData.selectedLabTests.forEach(test => {
        const testItem = labtest.find(t => t.id === test.id);
        if (testItem) {
          // Expand parent if this is a child test
          if (testItem.parentId !== null) {
            const parent = labtest.find(t => t.index === testItem.parentId);
            if (parent) newExpanded[parent.id] = true;
          }
          // Expand grandparent if this is a grandchild test
          const child = labtest.find(t => t.index === testItem.parentId);
          if (child && child.parentId !== null) {
            const grandparent = labtest.find(t => t.index === child.parentId);
            if (grandparent) newExpanded[grandparent.id] = true;
          }
        }
      });
      setExpandedCategories(newExpanded);
    }
  }, [initialData, labtest]);

  const labTestGroups = useMemo(() => {
    const groups = {};

    const parentTests = labtest.filter(test => test.parentId === null);

    parentTests.forEach(parent => {
      const children = labtest.filter(test => test.parentId === parent.index);

      groups[parent.id] = {
        parent,
        children: children.map(child => ({
          ...child,
          grandchildren: labtest.filter(test => test.parentId === child.index)
        }))
      };
    });

    return groups;
  }, [labtest]);

  const getAllTestIdsForParent = (parentId) => {
    const group = labTestGroups[parentId];
    if (!group) return [];

    const allTestIds = [];

    group.children.forEach(child => {
      allTestIds.push(child.id);
      child.grandchildren.forEach(grandchild => {
        allTestIds.push(grandchild.id);
      });
    });

    return allTestIds;
  };

  const getAllTestIdsForChild = (childId) => {
    const child = labtest.find(test => test.id === childId);
    if (!child) return [];

    return [
      childId,
      ...labtest.filter(test => test.parentId === child.index).map(test => test.id)
    ];
  };

  const isParentAllSelected = (parentId) => {
    const allTestIds = getAllTestIdsForParent(parentId);
    return allTestIds.length > 0 && allTestIds.every(id => selectedTests.includes(id));
  };

  const isParentSomeSelected = (parentId) => {
    const allTestIds = getAllTestIdsForParent(parentId);
    return allTestIds.some(id => selectedTests.includes(id)) && !isParentAllSelected(parentId);
  };

  const isChildAllSelected = (childId) => {
    const allTestIds = getAllTestIdsForChild(childId);
    return allTestIds.length > 0 && allTestIds.every(id => selectedTests.includes(id));
  };

  const isChildSomeSelected = (childId) => {
    const allTestIds = getAllTestIdsForChild(childId);
    return allTestIds.some(id => selectedTests.includes(id)) && !isChildAllSelected(childId);
  };

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleTestSelect = (testId, isSelected) => {
    if (isSelected) {
      setSelectedTests(prev => [...prev, testId]);
    } else {
      setSelectedTests(prev => prev.filter(id => id !== testId));
    }
  };

  const handleParentSelect = (parentId, isSelected) => {
    const allTestIds = getAllTestIdsForParent(parentId);

    if (isSelected) {
      setSelectedTests(prev => [...new Set([...prev, ...allTestIds])]);
    } else {
      setSelectedTests(prev => prev.filter(id => !allTestIds.includes(id)));
    }
  };

  const handleChildSelect = (childId, isSelected) => {
    const child = labtest.find(test => test.id === childId);
    if (!child) return;

    setSelectedTests(prev => {
      const newSelection = new Set(prev);
      const grandChildren = labtest.filter(test => test.parentId === child.index);

      if (isSelected) {
        newSelection.add(childId);
        grandChildren.forEach(g => newSelection.add(g.id));
      } else {
        newSelection.delete(childId);
        grandChildren.forEach(g => newSelection.delete(g.id));
      }
      return Array.from(newSelection);
    });
  };

  const renderFields = (fields, values, setFieldValue) => (
    <Grid container spacing={2}>
      {fields.map((field) => (
        <Grid item xs={12} sm={6} key={field.name}>
          {field.type === 'select' ? (
            <FormControl fullWidth>
              <InputLabel>{field.label}</InputLabel>
              <Select
                name={field.name}
                value={values[field.name] || ''}
                onChange={(e) => setFieldValue(field.name, e.target.value)}
                label={field.label}
              >
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : field.type === 'boolean' ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={values[field.name] || false}
                  onChange={(e) => setFieldValue(field.name, e.target.checked)}
                  name={field.name}
                />
              }
              label={field.label}
            />
          ) : field.type === 'number' ? (
            <Field
              as={TextField}
              fullWidth
              type="number"
              label={field.label}
              name={field.name}
              inputProps={field.inputProps || {}}
              InputProps={{ readOnly: field.readOnly || false }}
            />
          ) : field.type === 'date' ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label={field.label}
                value={values[field.name]}
                onChange={(val) => setFieldValue(field.name, val)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          ) : field.type === 'textarea' ? (
            <Field
              as={TextField}
              multiline
              fullWidth
              label={field.label}
              name={field.name}
              rows={4}
              maxRows={8}
              inputProps={field.inputProps || {}}
              InputProps={{
                readOnly: field.readOnly || false,
                ...field.InputProps
              }}
            />
          ) : (
            <Field
              as={TextField}
              fullWidth
              label={field.label}
              name={field.name}
              value={values[field.name] || ''}
              InputProps={{ readOnly: field.readOnly || false }}
            />
          )}
        </Grid>
      ))}
    </Grid>
  );

  const renderLabTestTab = () => (
    <Box sx={{ mt: 2 }}>
      {Object.keys(labTestGroups).length > 0 ? (
        <List
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'auto',
            maxHeight: 500,
            '& ul': { padding: 0 },
          }}
          subheader={<li />}
        >
          {Object.entries(labTestGroups).map(([parentId, group]) => (
            <li key={parentId}>
              <ul>
                <ListSubheader sx={{ bgcolor: 'background.paper', p: 1 }}>
                  <Accordion
                    expanded={expandedCategories[parentId] || false}
                    onChange={() => handleCategoryToggle(parentId)}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isParentAllSelected(parentId)}
                            indeterminate={isParentSomeSelected(parentId)}
                            onChange={(e) => handleParentSelect(parentId, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              color: theme.palette.primary[100],
                              '&.Mui-checked': {
                                color: theme.palette.primary[100],
                              },
                              '&:hover': {
                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography fontWeight="bold">
                            {group.parent.name}
                          </Typography>
                        }
                        sx={{ ml: 0 }}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
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
                                      color: theme.palette.primary[100],
                                      '&.Mui-checked': {
                                        color: theme.palette.primary[100],
                                      },
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
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
                                    <Box key={grandchild.id}>
                                      <ListItem sx={{ pl: 8 }}>
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              checked={selectedTests.includes(grandchild.id)}
                                              onChange={(e) => handleTestSelect(grandchild.id, e.target.checked)}
                                              sx={{
                                                color: theme.palette.primary[100],
                                                '&.Mui-checked': {
                                                  color: theme.palette.primary[100],
                                                },
                                              }}
                                            />
                                          }
                                          label={
                                            <Box>
                                              <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                                                {grandchild.name}
                                              </Typography>
                                              {grandchild.referencerange && (
                                                <Typography variant="caption" color="text.secondary">
                                                  Ref: {grandchild.referencerange}
                                                </Typography>
                                              )}
                                            </Box>
                                          }
                                        />
                                      </ListItem>

                                      {/* Add this section for the remark field */}
                                      {selectedTests.includes(grandchild.id) && (
                                        <ListItem sx={{ pl: 12, pt: 0 }}>
                                          <TextField
                                            fullWidth
                                            size="small"
                                            label="Remark"
                                            value={testRemarks[grandchild.id] || ''}
                                            onChange={(e) => {
                                              setTestRemarks(prev => ({
                                                ...prev,
                                                [grandchild.id]: e.target.value
                                              }));
                                            }}
                                          />
                                        </ListItem>
                                      )}
                                    </Box>
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
        <Typography>Loading lab tests...</Typography>
      )}

      {selectedTests.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Selected Tests:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedTests.map(testId => {
              const test = labtest.find(t => t.id === testId);
              return test ? (
                <Chip
                  key={testId}
                  label={`${test.name}${testRemarks[testId] ? ` (${testRemarks[testId]})` : ''}`}
                  onDelete={() => {
                    handleTestSelect(testId, false);
                    handleTestRemarkChange(testId, ''); // Clear remark when deleting
                  }}
                />
              ) : null;
            })}
          </Box>
        </Box>
      )}
    </Box>
  );

  const generateInitialValues = () => {
    const initialValues = {};

    // Combine all fields from all categories
    const allFields = [
      ...categorizedFields.healthInfo,
      ...categorizedFields.lifestyle,
      ...categorizedFields.vitalsAndExam,
      ...categorizedFields.other
    ];

    allFields.forEach((field) => {
      // Use initialData if available, otherwise use defaults
      if (initialData && initialData[field.name] !== undefined) {
        // Handle date fields specially
        if (field.type === 'date' && initialData[field.name]) {
          initialValues[field.name] = new Date(initialData[field.name]);
        } else {
          initialValues[field.name] = initialData[field.name];
        }
      } else {
        // Set defaults
        if (field.type === 'boolean') {
          initialValues[field.name] = false;
        } else if (field.type === 'date') {
          initialValues[field.name] = null;
        } else if (field.type === 'number') {
          initialValues[field.name] = 0;
        } else {
          initialValues[field.name] = '';
        }
      }
    });

    return initialValues;
  };

  // Role-based tab configuration
  const getTabsConfig = () => {
    const role = userRole?.toLowerCase();

    if (role === 'doctor') {
      return {
        tabs: [
          {
            label: "Health Info",
            render: (values, setFieldValue) => renderFields(categorizedFields.healthInfo, values, setFieldValue)
          },
          {
            label: "Lifestyle",
            render: (values, setFieldValue) => renderFields(categorizedFields.lifestyle, values, setFieldValue)
          },
          {
            label: "Lab Test",
            render: () => renderLabTestTab()
          },
          {
            label: "Other",
            render: (values, setFieldValue) => renderFields(categorizedFields.other, values, setFieldValue)
          }
        ],
        showAccessDenied: false
      };
    }

    if (role === 'emergency') {
      return {
        tabs: [
          {
            label: "Vitals & Exam",
            render: (values, setFieldValue) => renderFields(categorizedFields.vitalsAndExam, values, setFieldValue)
          }
        ],
        showAccessDenied: false
      };
    }

    return {
      tabs: [],
      showAccessDenied: true
    };
  };

  const handleSaveAndNext = (values, tabIndex, tabs) => {
    const submissionData = {
      ...values,
      selectedLabTests: labtest
        .filter((test) => selectedTests.includes(test.id))
        .map(test => ({
          id: test.id,
          name: test.name,
          referencerange: test.referencerange,
          remark: testRemarks[test.id] || ''
        }))
    };
    handelSubmite(submissionData);
    setTabIndex(tabIndex + 1);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
            PaperProps={{
              sx: {
                height: '45rem'
              },
            }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.primary[100],
            width: '100%',
            textAlign: 'center',
            mt: '3px'
          }}
        >
          Patient History Form
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon sx={{ color: 'red' }} />
        </IconButton>
      </DialogTitle>
      <Divider />
      <Formik
        initialValues={generateInitialValues()}
        enableReinitialize={true}
        onSubmit={(values) => {
          const submissionData = {
            ...values,
            selectedLabTests: labtest
              .filter((test) => selectedTests.includes(test.id))
              .map(test => ({
                id: test.id,
                name: test.name,
                referencerange: test.referencerange,
                remark: testRemarks[test.id] || ''
              }))
          };
          handelSubmite(submissionData);
          onClose();
        }}
      >
        {({ values, setFieldValue, handleReset: formikHandleReset }) => {
          const handleCombinedReset = () => {
            formikHandleReset();
            setSelectedTests([]);
            setTestRemarks({});
            setExpandedCategories({});
          };

          const { tabs, showAccessDenied } = getTabsConfig();
          const isLastTab = tabIndex === tabs.length - 1;

          return (
            <Form>
              <DialogContent dividers>
                {showAccessDenied ? (
                  <Typography variant="h6" color="error" sx={{ mt: 2, mb: 2 }}>
                    You do not have privilege to view this section.
                  </Typography>
                ) : (
                  <>
                    <Tabs
                      value={tabIndex}
                      onChange={handleTabChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{
                        '& .MuiTabs-indicator': {
                          backgroundColor: theme.palette.primary[100],
                        },
                      }}
                    >
                      {tabs.map((tab, index) => (
                        <Tab
                          key={index}
                          label={tab.label}
                          sx={{
                            '&.Mui-selected': {
                              color: theme.palette.primary[100],
                            },
                          }}
                        />
                      ))}
                    </Tabs>

                    <Box sx={{ mt: 3 }}>
                      {tabs[tabIndex]?.render(values, setFieldValue)}
                    </Box>
                  </>
                )}
              </DialogContent>

              {!showAccessDenied && (
                <DialogActions>
                  {isLastTab ? (
                    <>
                      <Button onClick={handleCombinedReset} color="secondary" variant="outlined">
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        sx={{
                          backgroundColor: theme.palette.primary[100],
                          '&:hover': { backgroundColor: theme.palette.primary[100] }
                        }}
                        variant="contained"
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setTabIndex(tabIndex + 1)}
                      sx={{
                        backgroundColor: theme.palette.primary[100],
                        '&:hover': { backgroundColor: theme.palette.primary[100] }
                      }}
                      variant="contained"
                    >
                      Next
                    </Button>
                  )}
                </DialogActions>
              )}
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default PatientHistory;
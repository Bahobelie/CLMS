import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  CardContent,
  Grid,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Image as ImageIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  ZoomIn as ZoomIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import axios from 'axios';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';

const PatientImages = ({ patient, apiUrl, refreshPatient }) => {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState({
    open: false,
    file: null,
    imageUrl: '',
    title: '',
    notes: ''
  });
  const [hoveredImage, setHoveredImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*') && !file.name.endsWith('.dcm')) {
      Swal.fire('Error!', 'Only image and DICOM files are allowed', 'error');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error!', 'File size should be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview({
        open: true,
        file,
        imageUrl: e.target.result,
        title: `Ultrasound ${format(new Date(), 'MMM dd, yyyy')}`,
        notes: ''
      });
    };
    reader.readAsDataURL(file);
  };

  const confirmUpload = async () => {
    try {
      setUploading(true);

      // Close the dialog immediately when upload starts
      setUploadPreview({ ...uploadPreview, open: false });

      // Get the next code first
      const response = await axios.get(`${apiUrl}/model/next-code`, {
        params: {
          model: 'ultarsound',
          prefix: 'ULS-'
        }
      });

      const formData = new FormData();
      const originalFile = uploadPreview.file;
      const fileExtension = originalFile.name.split('.').pop();
      const safeFileName = `ultrasound_${Date.now()}.${fileExtension}`;

      formData.append('image', originalFile,safeFileName);
      formData.append('patientId', parseInt(patient.id, 10));
      formData.append('code', response.data.code);
      formData.append('name', uploadPreview.title);
      formData.append('description', uploadPreview.notes);
      formData.append('patientName',patient.first_name)

      console.log('form',formData)

      await axios.post(`${apiUrl}/ultarsounds/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await Swal.fire({
        title: 'Success!',
        text: 'Ultrasound uploaded successfully',
        icon: 'success',
        timer: 2000
      });

      refreshPatient();
    } catch (error) {
      console.error('Upload error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to upload ultrasound',
        icon: 'error'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.text.disabled,
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${apiUrl}/ultarsounds/${imageId}`);
        await Swal.fire('Deleted!', 'The image has been deleted.', 'success');
        refreshPatient();
      } catch (error) {
        await Swal.fire('Error!', 'Failed to delete image', 'error');
      }
    }
  };

  const openPreview = (image) => {
    setPreviewImage(image);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <CardContent>
      {/* Header with Upload Button */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h5" sx={{ color: theme.palette.primary.main }}>
          Medical Images
        </Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark
            }
          }}
        >
          Upload Ultrasound
          <input
            type="file"
            hidden
            accept="image/*,.dcm"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            ref={fileInputRef}
          />
        </Button>
      </Box>

      {/* Image Grid */}
      {patient.ultarsounds?.length > 0 ? (
        <Grid container spacing={3}>
          {patient.ultarsounds.map((ultrasound) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={ultrasound.id}>
              <Paper
                elevation={hoveredImage === ultrasound.id ? 6 : 3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  transform: hoveredImage === ultrasound.id ? 'translateY(-4px)' : 'none',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: theme.shadows[8]
                  }
                }}
                onMouseEnter={() => setHoveredImage(ultrasound.id)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                {/* Image Container */}
                <Box sx={{
                  position: 'relative',
                  paddingTop: '75%',
                  mb: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: theme.shadows[2]
                }}
                     onClick={() => openPreview(ultrasound)}
                >
                  <img
                    src={`${apiUrl}/uploads/ultarsounds/${ultrasound.imagePath}`}
                    alt={`Ultrasound ${format(new Date(ultrasound.createdAt), 'MMM dd, yyyy')}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'all 0.3s ease',
                      filter: hoveredImage === ultrasound.id ? 'brightness(0.9)' : 'none'
                    }}
                  />

                  {/* Action Buttons */}
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1,
                    opacity: hoveredImage === ultrasound.id ? 1 : 0,
                    transition: 'opacity 0.3s'
                  }}>
                    <Tooltip title="View Full Size">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(ultrasound);
                        }}
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)'
                          }
                        }}
                      >
                        <ZoomIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Image">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(ultrasound.id);
                        }}
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)'
                          }
                        }}
                      >
                        <DeleteIcon color="error" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Image Metadata */}
                <Box>
                  <Typography variant="subtitle2" noWrap>
                    {ultrasound.name || 'Untitled Ultrasound'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {format(new Date(ultrasound.createdAt), 'MMM dd, yyyy - hh:mm a')}
                  </Typography>
                  {ultrasound.description && (
                    <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                      {ultrasound.description}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 300,
          border: `2px dashed ${theme.palette.divider}`,
          borderRadius: 2,
          backgroundColor: theme.palette.background.default,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.action.hover
          }
        }}>
          <ImageIcon sx={{
            fontSize: 64,
            color: 'text.disabled',
            mb: 2,
            opacity: 0.6
          }} />
          <Typography
            color="textSecondary"
            sx={{ mb: 2 }}
            variant="body1"
          >
            No ultrasound images available
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
                borderColor: theme.palette.primary.dark
              }
            }}
          >
            Upload First Image
            <input
              type="file"
              hidden
              accept="image/*,.dcm"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
          </Button>
        </Box>
      )}

      {/* Upload Preview Dialog */}
      <Dialog
        open={uploadPreview.open}
        onClose={() => !uploading && setUploadPreview({ ...uploadPreview, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Confirm Upload</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <Box sx={{
              position: 'relative',
              paddingTop: '60%',
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 1,
              overflow: 'hidden',
              backgroundColor: '#f5f5f5'
            }}>
              <img
                src={uploadPreview.imageUrl}
                alt="Upload preview"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>

            <TextField
              label="Title"
              value={uploadPreview.title}
              onChange={(e) => setUploadPreview({...uploadPreview, title: e.target.value})}
              fullWidth
              margin="normal"
              disabled={uploading}
            />

            <TextField
              label="Notes"
              value={uploadPreview.notes}
              onChange={(e) => setUploadPreview({...uploadPreview, notes: e.target.value})}
              multiline
              rows={3}
              fullWidth
              margin="normal"
              disabled={uploading}
            />

            <Typography variant="caption" color="textSecondary">
              File: {uploadPreview.file?.name} • {Math.round(uploadPreview.file?.size / 1024)} KB • {uploadPreview.file?.type || 'DICOM'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setUploadPreview({ ...uploadPreview, open: false })}
            color="secondary"
            disabled={uploading}
            sx={{
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmUpload}
            variant="contained"
            color="primary"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={uploading}
            sx={{
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            {uploading ? 'Uploading...' : 'Confirm Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={Boolean(previewImage)}
        onClose={closePreview}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {previewImage && (
            <>
              <img
                src={`${apiUrl}/uploads/ultarSounds/${previewImage.imagePath}`}
                alt={`Preview - ${previewImage.name || 'Ultrasound'}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
              <IconButton
                aria-label="close"
                onClick={closePreview}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: theme.palette.common.white,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </>
          )}
        </DialogContent>
        {previewImage && (
          <DialogActions sx={{
            justifyContent: 'space-between',
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            padding: theme.spacing(2)
          }}>
            <Box>
              <Typography variant="subtitle1">
                {previewImage.name || 'Untitled Ultrasound'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Uploaded: {format(new Date(previewImage.createdAt), 'MMM dd, yyyy - hh:mm a')}
              </Typography>
            </Box>
            <Button
              startIcon={<DeleteIcon />}
              onClick={() => {
                closePreview();
                handleDeleteImage(previewImage.id);
              }}
              color="error"
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.error.light
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </CardContent>
  );
};

export default PatientImages;
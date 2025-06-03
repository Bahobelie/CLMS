import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  CardContent,
  Grid,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Tooltip,
  CircularProgress,
  Chip,
  useMediaQuery,
  DialogTitle,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Image as ImageIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  ZoomIn as ZoomIcon,
  ZoomOut as ZoomOutIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import axios from 'axios';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';

const PatientImages = ({ patient, apiUrl, refreshPatient }) => {
  const imageUrl = import.meta.env.VITE_APP_IMAGE_PATH;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [uploadPreview, setUploadPreview] = useState({
    open: false,
    file: null,
    imageUrl: '',
    title: '',
    notes: ''
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    image: null,
    notes: '',
    title: ''
  });

  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.match('image.*') && !file.name.endsWith('.dcm')) {
      Swal.fire('Error!', 'Only image and DICOM files are allowed', 'error');
      return;
    }

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
      setUploadPreview({ ...uploadPreview, open: false });

      const response = await axios.get(`${apiUrl}/model/next-code`, {
        params: { model: 'ultarsound', prefix: 'ULS-' }
      });

      const formData = new FormData();
      const file = uploadPreview.file;
      const ext = file.name.split('.').pop();
      const filename = `ultrasound_${Date.now()}.${ext}`;

      formData.append('image', file, filename);
      formData.append('patientId', parseInt(patient.id, 10));
      formData.append('code', response.data.code);
      formData.append('name', uploadPreview.title);
      formData.append('description', uploadPreview.notes);

      await axios.post(`${apiUrl}/ultarsounds/upload`, formData, {
        params:{
          patientName:patient.first_name,
          code:response.data.code
        },
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await Swal.fire('Success!', 'Ultrasound uploaded successfully', 'success');
      refreshPatient();
    } catch (error) {
      await Swal.fire('Error!', error.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/ultarsounds/by-condition`, {
          params: { patientId: patient.id }
        });
        setImages(response.data);

      } catch (err) {
        console.error('Image fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    if (patient?.id) fetchImages();
  }, [patient?.id, apiUrl]);

  const handleDeleteImage = async (image) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${apiUrl}/ultarsounds/${image.id}`);
        setImages(images.filter(img => img.id !== image.id));
        await Swal.fire('Deleted!', 'Image has been deleted.', 'success');
      } catch(error) {
        console.log(error)
        await Swal.fire('Error!', 'Failed to delete image', 'error');
      }
    }
  };

  const openEditDialog = (image) => {
    setEditDialog({
      open: true,
      image,
      notes: image.description || '',
      title: image.name || ''
    });
  };

  const handleEditSave = async () => {
    try {
      const { image, title, notes } = editDialog;
      await axios.put(`${apiUrl}/ultarsounds/${image.id}`, {
        name: title,
        description: notes
      });

      setImages(images.map(img =>
        img.id === image.id ? { ...img, name: title, description: notes } : img
      ));
      setEditDialog({ ...editDialog, open: false });
      await Swal.fire('Success!', 'Image details updated successfully', 'success');

    } catch (error) {
      await Swal.fire('Error!', 'Failed to update image details', 'error');
    }
  };

  const openPreview = (image) => {
    setPreviewImage(image);
    setZoomLevel(1);
  };

  const closePreview = () => setPreviewImage(null);
  const handleZoomIn = () => setZoomLevel(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(z => Math.max(z - 0.25, 0.5));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{color:theme.palette.primary[100]}}>Medical Images</Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            '&:hover': { backgroundColor: theme.palette.secondary.dark }
          }}
        >
          Upload New
          <input
            type="file"
            hidden
            accept="image/*,.dcm"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            ref={fileInputRef}
          />
        </Button>
      </Box>

      {!Array.isArray(images) || images.length === 0 ? (
        <Box textAlign="center" p={4} border="2px dashed" borderColor="divider" borderRadius={2}>
          <ImageIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography>No images available for this patient</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {images?.map((img) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={img.id}>
              <Paper
                elevation={hoveredImage === img.id ? 6 : 3}
                onMouseEnter={() => setHoveredImage(img.id)}
                onMouseLeave={() => setHoveredImage(null)}
                sx={{ position: 'relative', p: 2, borderRadius: 2, cursor: 'pointer' }}
                onClick={() => openPreview(img)}
              >
                <img
                  src={`${imageUrl}/images/${img.imageUrl.split('/').pop()}`}
                  alt={img.name}
                  style={{
                    width: '100%',
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 8
                  }}
                />
                <Box mt={1}>
                  <Typography variant="subtitle2" noWrap>{img.name}</Typography>
                  <Typography variant="caption" color="textSecondary" noWrap>
                    {format(new Date(img.createdAt), 'PPpp')}
                  </Typography>
                </Box>
                <Divider/>
                <Box mt={1} sx={{
                  maxHeight: 80, // Limit height
                  overflow: 'hidden', // Hide overflow
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3, // Show max 3 lines
                  WebkitBoxOrient: 'vertical'
                }}>
                  <Typography variant="subtitle2">Note</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {img.description || 'No description'}
                  </Typography>
                </Box>


                {hoveredImage === img.id && (
                  <Box position="absolute" top={8} right={8} display="flex" gap={1}>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(img);
                        }}
                        size="small"
                      >
                        <EditIcon sx={{color:'red'}} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(img);
                        }}
                        size="small"
                      >
                        <ZoomIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(img);
                        }}
                        size="small"
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Zoom Preview Dialog */}
      <Dialog open={!!previewImage} onClose={closePreview} maxWidth="md" fullWidth>
        <DialogTitle>
          {previewImage?.name}
          <IconButton onClick={closePreview} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent onWheel={handleZoomIn} sx={{ textAlign: 'center' }}>
          <Box mt={1} sx={{
            maxHeight: 80, // Limit height
            overflow: 'hidden', // Hide overflow
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3, // Show max 3 lines
            WebkitBoxOrient: 'vertical'
          }}>
            <Typography variant="subtitle2">Note</Typography>
            <Typography variant="boody2" color="textSecondary">
              {previewImage?.description || 'No description'}
            </Typography>
          </Box>
          <img
            src={`${imageUrl}/images/${previewImage?.imageUrl.split('/').pop()}`}
            alt={previewImage?.name}
            style={{
              maxWidth: '100%',
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.3s ease'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleZoomOut} startIcon={<ZoomOutIcon />}>Zoom Out</Button>
          <Button onClick={handleZoomIn} startIcon={<ZoomIcon />}>Zoom In</Button>
        </DialogActions>
      </Dialog>

      {/* Upload Preview Dialog */}
      <Dialog open={uploadPreview.open} onClose={() => setUploadPreview({ ...uploadPreview, open: false })}>
        <DialogTitle>Preview & Upload</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <img
              src={uploadPreview.imageUrl}
              alt="Preview"
              style={{ maxWidth: '100%', borderRadius: 8 }}
            />
            <TextField
              label="Title"
              fullWidth
              value={uploadPreview.title}
              onChange={(e) => setUploadPreview({ ...uploadPreview, title: e.target.value })}
            />
            <TextField
              label="Notes"
              fullWidth
              multiline
              minRows={3}
              value={uploadPreview.notes}
              onChange={(e) => setUploadPreview({ ...uploadPreview, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadPreview({ ...uploadPreview, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={confirmUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Confirm Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ ...editDialog, open: false })}>
        <DialogTitle>Edit Image Details</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Title"
              fullWidth
              value={editDialog.title}
              onChange={(e) => setEditDialog({ ...editDialog, title: e.target.value })}
            />
            <TextField
              label="Notes"
              fullWidth
              multiline
              minRows={3}
              value={editDialog.notes}
              onChange={(e) => setEditDialog({ ...editDialog, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ ...editDialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </CardContent>
  );
};

export default PatientImages;
// app/page.js
'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { AppBar, Toolbar, Typography, Button, Box, Container, TextField, Stack, Paper, IconButton, Modal, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { auth, firestore } from '@/firebase';
import { login, register, logout } from '@/auth';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Page() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setCurrentPage('inventory');
        updateInventory();
      } else {
        setUser(null);
        setCurrentPage('landing');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      setEmail('');
      setPassword('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Invalid email or password. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      setEmail('');
      setPassword('');
      setErrorMessage('');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Email already in use. Please use a different email.');
      } else {
        setErrorMessage('Error creating account. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentPage('landing');
  };

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = docs.docs.map(doc => ({ name: doc.id, ...doc.data() }));
    setInventory(inventoryList);
  };

  const addItem = async (item, category) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity, category: existingCategory } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, category: existingCategory });
    } else {
      await setDoc(docRef, { quantity: 1, category });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity, category } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1, category });
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const categorizedInventory = inventory.reduce((acc, item) => {
    const { category } = item;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" alignItems="center">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory Managemer Pro
          </Typography>
          {user ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button color="inherit" onClick={() => setCurrentPage('login')}>Login</Button>
              <Button color="inherit" onClick={() => setCurrentPage('register')}>Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {currentPage === 'landing' && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" textAlign="center">
            <Typography variant="h4" gutterBottom>Welcome to Inventory Managemer Pro</Typography>
            <Typography variant="h6" align="center" gutterBottom>
              Manage your inventory effortlessly with our app. Keep track of your items, add new ones, and update quantities all in one place.
            </Typography>
            <Box mt={4}>
              <Image src="/images/Inventory.jpg" alt="Inventory Management" width={500} height={300} />
            </Box>
            <Box mt={4}>
              <Button variant="contained" color="primary" onClick={() => setCurrentPage('login')} sx={{ mr: 2 }}>
                Login
              </Button>
              <Button variant="outlined" color="primary" onClick={() => setCurrentPage('register')}>
                Register
              </Button>
            </Box>
          </Box>
        )}
        {currentPage === 'login' && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
            <Typography variant="h4" gutterBottom>Login</Typography>
            <form onSubmit={handleLogin}>
              <Box mb={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                />
              </Box>
              <Box mb={2}>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                />
              </Box>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Login
              </Button>
            </form>
            {errorMessage && <Typography color="error" sx={{ mt: 2 }}>{errorMessage}</Typography>}
            <Button color="inherit" onClick={() => setCurrentPage('register')} sx={{ mt: 2 }}>Register</Button>
          </Box>
        )}
        {currentPage === 'register' && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
            <Typography variant="h4" gutterBottom>Register</Typography>
            <form onSubmit={handleRegister}>
              <Box mb={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                />
              </Box>
              <Box mb={2}>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                />
              </Box>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Register
              </Button>
            </form>
            {errorMessage && <Typography color="error" sx={{ mt: 2 }}>{errorMessage}</Typography>}
            <Button color="inherit" onClick={() => setCurrentPage('login')} sx={{ mt: 2 }}>Login</Button>
          </Box>
        )}
        {currentPage === 'inventory' && (
          <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 2, maxHeight: '70vh', overflow: 'auto' }}>
              <Typography variant="h4" gutterBottom>Inventory Items</Typography>
              {Object.keys(categorizedInventory).map((category) => (
                <Box key={category} sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ mb: 2 }}>{category.charAt(0).toUpperCase() + category.slice(1)}</Typography>
                  <Stack spacing={2}>
                    {categorizedInventory[category].map(({ name, quantity }) => (
                      <Box
                        key={name}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        p={2}
                        sx={{ bgcolor: '#f0f0f0', borderRadius: 1 }}
                      >
                        <Typography variant="h6" sx={{ flex: 1 }}>
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton onClick={() => removeItem(name)}>
                            <Remove />
                          </IconButton>
                          <Typography variant="h6">Quantity: {quantity}</Typography>
                          <IconButton onClick={() => addItem(name, category)}>
                            <Add />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Paper>
            <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mt: 2 }}>
              Add New Item
            </Button>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
              <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">Add Item</Typography>
                <Stack width="100%" direction="column" spacing={2}>
                  <TextField
                    id="outlined-basic"
                    label="Item"
                    variant="outlined"
                    fullWidth
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                  <FormControl fullWidth>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category-select"
                      value={category}
                      label="Category"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="meat">Meat</MenuItem>
                      <MenuItem value="dairy">Dairy</MenuItem>
                      <MenuItem value="fruit">Fruit</MenuItem>
                      <MenuItem value="vegetable">Vegetable</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="outlined" onClick={() => {
                    addItem(itemName, category);
                    setItemName('');
                    setCategory('');
                    handleClose();
                  }}>
                    Add
                  </Button>
                </Stack>
              </Box>
            </Modal>
          </Container>
        )}
      </Container>
    </Box>
  );
}

import { useState } from 'react'
import './App.css'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import EditPage from './pages/EditPage'
import React from 'react'
import Dashboard from './components/dashboard'
import ApiSyncList from './components/interface_auto/apiSyncList'
import ScenConfig from './components/interface_auto/apiAutoSceneConfig'
import EditScene from './components/interface_auto/editScene'
import TaskList from './components/interface_auto/apiAutoTaskConfig'

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/edit' element={<EditPage />} />
        <Route path='/dashboard' element={<Dashboard />}>
          <Route path='/dashboard/api/scene' element = {<ScenConfig />} />
          <Route path='/dashboard/api/sync' element={<ApiSyncList  />} />
          <Route path='/dashboard/api/scene/edit' element={<EditScene />} />
          <Route path='/dashboard/api/task' element={<TaskList />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

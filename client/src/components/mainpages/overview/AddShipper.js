import React, { useState, useContext } from 'react'
import { GlobalState } from '../../../GlobalState'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

function AddShipper() {
  const state = useContext(GlobalState)
  const [token] = state.token
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: ''
  })

  const onChangeInput = (e) => {
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
  }

  const addShipperSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/user/addshipper', { ...user }, {
        headers: { Authorization: token }
      })

      toast.success('Add shipper successfully.', {
        autoClose: 2000
      })

      setTimeout(() => {
        window.location.href = '/shipper'
      }, 2200)

    } catch (error) {
      toast.error(error.response.data.msg)
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={addShipperSubmit} className="form-signin-signout">
        <h2>New Shipper</h2>

        <label>Username</label>
        <input type="text" name="username"
          value={user.username}
          onChange={onChangeInput}
          required
        />

        <label>Email</label>
        <input type="email" name="email"
          value={user.email}
          onChange={onChangeInput}
          required
        />

        <label>Password</label>
        <input type="password" name="password"
          value={user.password}
          autoComplete="on"
          onChange={onChangeInput}
          required
        />
        <div className="row">
          <button type="submit">ADD SHIPPER</button>
          <Link to="/shipper">BACK</Link>
        </div>
      </form>
    </div>
  )
}

export default AddShipper

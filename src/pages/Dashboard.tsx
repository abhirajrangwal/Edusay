import { useEffect, useMemo, useState } from 'react'
import {
  BedDouble,
  Bell,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  LogOut,
  MessageSquare,
  UserRound,
  Save,
  Pencil,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/Dashboard.css'

type ActivePage =
  | 'overview'
  | 'complaints'
  | 'fees'
  | 'profile'

type Complaint = {
  id: number
  title: string
  status: 'Open' | 'Resolved'
  created_at: string
}

type Room = {
  id: number
  room_number: string
  floor: number
  capacity: number
  occupied: number
  status: 'Available' | 'Full' | 'Maintenance'
}

type RoomMember = {
  id: string
  full_name: string
  email: string
}

type RoomAllocation = {
  room_id: number
  student_id: string
}

type Fee = {
  id: number
  amount: number
  due_date: string
  status: 'Pending' | 'Paid' | 'Overdue'
  payment_date: string | null
  description: string | null
  created_at: string
}

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
  phone: string | null
  course: string | null
  year: string | number | null
  guardian_name: string | null
  guardian_phone: string | null
}

type ProfileForm = {
  full_name: string
  phone: string
  course: string
  year: string
  guardian_name: string
  guardian_phone: string
}

function Dashboard() {
  const navigate = useNavigate()

  const [active, setActive] =
    useState<ActivePage>('overview')

  // ==================================================
  // COMPLAINTS
  // ==================================================

  const [complaints, setComplaints] =
    useState<Complaint[]>([])

  const [loadingComplaints, setLoadingComplaints] =
    useState(true)

  const [addingComplaint, setAddingComplaint] =
    useState(false)

  // ==================================================
  // ROOM
  // ==================================================

  const [room, setRoom] =
    useState<Room | null>(null)

  const [roomMembers, setRoomMembers] =
    useState<RoomMember[]>([])

  const [loadingRoom, setLoadingRoom] =
    useState(true)

  // ==================================================
  // FEES
  // ==================================================

  const [fees, setFees] =
    useState<Fee[]>([])

  const [loadingFees, setLoadingFees] =
    useState(true)

  // ==================================================
  // PROFILE
  // ==================================================

  const [profile, setProfile] =
    useState<Profile | null>(null)

  const [profileForm, setProfileForm] =
    useState<ProfileForm>({
      full_name: '',
      phone: '',
      course: '',
      year: '',
      guardian_name: '',
      guardian_phone: '',
    })

  const [loadingProfile, setLoadingProfile] =
    useState(true)

  const [savingProfile, setSavingProfile] =
    useState(false)

  const [editingProfile, setEditingProfile] =
    useState(false)

  const [profileMessage, setProfileMessage] =
    useState('')

  // ==================================================
  // ERROR
  // ==================================================

  const [error, setError] = useState('')

  // ==================================================
  // LOCAL USER
  // ==================================================

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem('edustay_user') || '{}'
      )
    } catch {
      return {}
    }
  }, [])

  // ==================================================
  // GET CURRENT SUPABASE USER
  // ==================================================

  const getCurrentUser = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    return authUser
  }

  // ==================================================
  // LOAD PROFILE
  // ==================================================

  const loadProfile = async () => {
    setLoadingProfile(true)
    setProfileMessage('')

    const authUser = await getCurrentUser()

    if (!authUser) {
      setLoadingProfile(false)
      navigate('/login')
      return
    }

    const {
      data,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        role,
        created_at,
        phone,
        course,
        year,
        guardian_name,
        guardian_phone
      `)
      .eq('id', authUser.id)
      .maybeSingle()

    if (profileError) {
      console.error(
        'Load profile error:',
        profileError
      )

      setError(profileError.message)
      setProfile(null)
      setLoadingProfile(false)
      return
    }

    if (!data) {
      setProfile(null)
      setLoadingProfile(false)
      return
    }

    setProfile(data)

    setProfileForm({
      full_name: data.full_name || '',
      phone: data.phone || '',
      course: data.course || '',
      year:
        data.year !== null &&
        data.year !== undefined
          ? String(data.year)
          : '',
      guardian_name:
        data.guardian_name || '',
      guardian_phone:
        data.guardian_phone || '',
    })

    setLoadingProfile(false)
  }

  // ==================================================
  // SAVE PROFILE
  // ==================================================

  const saveProfile = async () => {
    setSavingProfile(true)
    setError('')
    setProfileMessage('')

    const authUser = await getCurrentUser()

    if (!authUser) {
      setSavingProfile(false)
      navigate('/login')
      return
    }

    const {
      data,
      error: updateError,
    } = await supabase
      .from('profiles')
      .update({
        full_name:
          profileForm.full_name.trim(),

        phone:
          profileForm.phone.trim() || null,

        course:
          profileForm.course.trim() || null,

        year:
          profileForm.year.trim() || null,

        guardian_name:
          profileForm.guardian_name.trim() ||
          null,

        guardian_phone:
          profileForm.guardian_phone.trim() ||
          null,
      })
      .eq('id', authUser.id)
      .select(`
        id,
        full_name,
        email,
        role,
        created_at,
        phone,
        course,
        year,
        guardian_name,
        guardian_phone
      `)
      .single()

    if (updateError) {
      console.error(
        'Save profile error:',
        updateError
      )

      setError(updateError.message)
      setSavingProfile(false)
      return
    }

    setProfile(data)

    setProfileForm({
      full_name: data.full_name || '',
      phone: data.phone || '',
      course: data.course || '',
      year:
        data.year !== null &&
        data.year !== undefined
          ? String(data.year)
          : '',
      guardian_name:
        data.guardian_name || '',
      guardian_phone:
        data.guardian_phone || '',
    })

    try {
      const existingUser = JSON.parse(
        localStorage.getItem(
          'edustay_user'
        ) || '{}'
      )

      localStorage.setItem(
        'edustay_user',
        JSON.stringify({
          ...existingUser,
          name: data.full_name,
          full_name: data.full_name,
        })
      )
    } catch {
      // Ignore localStorage errors
    }

    setEditingProfile(false)

    setProfileMessage(
      'Profile updated successfully.'
    )

    setSavingProfile(false)
  }

  // ==================================================
  // PROFILE FORM HANDLER
  // ==================================================

  const updateProfileField = (
    field: keyof ProfileForm,
    value: string
  ) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // ==================================================
  // LOAD COMPLAINTS
  // ==================================================

  const loadComplaints = async () => {
    setLoadingComplaints(true)

    const authUser = await getCurrentUser()

    if (!authUser) {
      setLoadingComplaints(false)
      navigate('/login')
      return
    }

    const {
      data,
      error: complaintsError,
    } = await supabase
      .from('complaints')
      .select(
        'id, title, status, created_at'
      )
      .eq('student_id', authUser.id)
      .order('created_at', {
        ascending: false,
      })

    if (complaintsError) {
      console.error(
        'Load complaints error:',
        complaintsError
      )

      setError(complaintsError.message)
      setComplaints([])
    } else {
      setComplaints(data || [])
    }

    setLoadingComplaints(false)
  }

  // ==================================================
  // LOAD ROOM
  // ==================================================

  const loadRoom = async () => {
    setLoadingRoom(true)

    const authUser = await getCurrentUser()

    if (!authUser) {
      setLoadingRoom(false)
      navigate('/login')
      return
    }

    try {
      const {
        data: allocation,
        error: allocationError,
      } = await supabase
        .from('room_allocations')
        .select(
          'room_id, student_id'
        )
        .eq('student_id', authUser.id)
        .maybeSingle()

      if (allocationError) {
        console.error(
          'Room allocation error:',
          allocationError
        )

        setError(allocationError.message)
        setRoom(null)
        setRoomMembers([])
        setLoadingRoom(false)
        return
      }

      if (!allocation) {
        setRoom(null)
        setRoomMembers([])
        setLoadingRoom(false)
        return
      }

      const {
        data: roomData,
        error: roomError,
      } = await supabase
        .from('rooms')
        .select(`
          id,
          room_number,
          floor,
          capacity,
          occupied,
          status
        `)
        .eq('id', allocation.room_id)
        .single()

      if (roomError) {
        console.error(
          'Room error:',
          roomError
        )

        setError(roomError.message)
        setRoom(null)
        setRoomMembers([])
        setLoadingRoom(false)
        return
      }

      setRoom(roomData)

      const {
        data: allocations,
        error: membersError,
      } = await supabase
        .from('room_allocations')
        .select('student_id')
        .eq(
          'room_id',
          allocation.room_id
        )

      if (membersError) {
        console.error(
          'Room members error:',
          membersError
        )

        setError(membersError.message)
        setRoomMembers([])
        setLoadingRoom(false)
        return
      }

      const studentIds =
        (allocations || []).map(
          (item: RoomAllocation) =>
            item.student_id
        )

      if (studentIds.length === 0) {
        setRoomMembers([])
        setLoadingRoom(false)
        return
      }

      const {
        data: members,
        error: profilesError,
      } = await supabase
        .from('profiles')
        .select(
          'id, full_name, email'
        )
        .in('id', studentIds)

      if (profilesError) {
        console.error(
          'Room member profiles error:',
          profilesError
        )

        setError(profilesError.message)
        setRoomMembers([])
        setLoadingRoom(false)
        return
      }

      setRoomMembers(members || [])
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load room information.'
      )
    }

    setLoadingRoom(false)
  }

  // ==================================================
  // LOAD FEES
  // ==================================================

  const loadFees = async () => {
    setLoadingFees(true)

    const authUser = await getCurrentUser()

    if (!authUser) {
      setLoadingFees(false)
      navigate('/login')
      return
    }

    const {
      data,
      error: feesError,
    } = await supabase
      .from('fees')
      .select(`
        id,
        amount,
        due_date,
        status,
        payment_date,
        description,
        created_at
      `)
      .eq('student_id', authUser.id)
      .order('due_date', {
        ascending: false,
      })

    if (feesError) {
      console.error(
        'Load fees error:',
        feesError
      )

      setError(feesError.message)
      setFees([])
    } else {
      setFees(data || [])
    }

    setLoadingFees(false)
  }

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadComplaints()
    loadRoom()
    loadFees()
    loadProfile()
  }, [])

  // ==================================================
  // LOGOUT
  // ==================================================

  const logout = async () => {
    await supabase.auth.signOut()

    localStorage.removeItem(
      'edustay_user'
    )

    navigate('/login')
  }

  // ==================================================
  // ADD COMPLAINT
  // ==================================================

  const addComplaint = async () => {
    const title = window.prompt(
      'What issue would you like to report?'
    )

    if (!title?.trim()) return

    setAddingComplaint(true)
    setError('')

    const authUser = await getCurrentUser()

    if (!authUser) {
      setAddingComplaint(false)
      navigate('/login')
      return
    }

    const { error: complaintError } =
      await supabase
        .from('complaints')
        .insert({
          student_id: authUser.id,
          title: title.trim(),
          status: 'Open',
        })

    if (complaintError) {
      console.error(
        'Add complaint error:',
        complaintError
      )

      setError(complaintError.message)
      setAddingComplaint(false)
      return
    }

    await loadComplaints()

    setAddingComplaint(false)
    setActive('complaints')
  }

  // ==================================================
  // REFRESH
  // ==================================================

  const refreshData = async () => {
    setError('')

    await Promise.all([
      loadComplaints(),
      loadRoom(),
      loadFees(),
      loadProfile(),
    ])
  }

  // ==================================================
  // FEE HELPERS
  // ==================================================

  const totalFees = fees.reduce(
    (sum, fee) =>
      sum + Number(fee.amount || 0),
    0
  )

  const paidFees = fees
    .filter(
      fee => fee.status === 'Paid'
    )
    .reduce(
      (sum, fee) =>
        sum + Number(fee.amount || 0),
      0
    )

  const pendingFees = fees
    .filter(
      fee =>
        fee.status === 'Pending' ||
        fee.status === 'Overdue'
    )
    .reduce(
      (sum, fee) =>
        sum + Number(fee.amount || 0),
      0
    )

  const latestFee =
    fees.length > 0
      ? fees[0]
      : null

  const formatCurrency = (
    amount: number
  ) => {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }
    ).format(amount)
  }

  const formatDate = (
    date: string
  ) => {
    if (!date) return '—'

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  const getFeeStatusClass = (
    status: Fee['status']
  ) => {
    if (status === 'Paid') {
      return 'paid-status'
    }

    if (status === 'Overdue') {
      return 'overdue-status'
    }

    return 'pending-status'
  }

  // ==================================================
  // FLOOR
  // ==================================================

  const getFloorText = (
    floor: number
  ) => {
    if (floor === 1) return '1st'
    if (floor === 2) return '2nd'
    if (floor === 3) return '3rd'

    return `${floor}th`
  }

  // ==================================================
  // DISPLAY NAME
  // ==================================================

  const displayName =
    profile?.full_name ||
    user.name ||
    user.full_name ||
    'Student'

  // ==================================================
  // UI
  // ==================================================

  return (
    <main className="dashboard-page">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">

        <button
          className="dashboard-logo"
          onClick={() =>
            navigate('/')
          }
        >
          EduStay<span>.</span>
        </button>

        <nav className="dashboard-nav">

          <button
            className={
              active === 'overview'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActive('overview')
            }
          >
            <BedDouble size={18} />
            Overview
          </button>

          <button
            className={
              active === 'complaints'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActive('complaints')
            }
          >
            <MessageSquare size={18} />
            Complaints
          </button>

          <button
            className={
              active === 'fees'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActive('fees')
            }
          >
            <CreditCard size={18} />
            Fees
          </button>

          <button
            className={
              active === 'profile'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActive('profile')
            }
          >
            <UserRound size={18} />
            Profile
          </button>

        </nav>

        <button
          className="dashboard-logout"
          onClick={logout}
        >
          <LogOut size={17} />
          Logout
        </button>

      </aside>

      {/* MAIN */}

      <section className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <p className="dashboard-label">
              STUDENT DASHBOARD
            </p>

            <h1>
              Hello, {displayName}.
            </h1>

          </div>

          <div className="dashboard-user">

            <Bell size={18} />

            <span>
              <UserRound size={18} />
              Student
            </span>

          </div>

        </header>

        {/* ERROR */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* ==================================================
            PROFILE
        ================================================== */}

        {active === 'profile' && (

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <p className="dashboard-label">
                  STUDENT PROFILE
                </p>

                <h2>
                  Your profile
                </h2>

              </div>

              {!editingProfile &&
                !loadingProfile && (

                  <button
                    className="panel-action"
                    onClick={() => {
                      setProfileMessage('')
                      setEditingProfile(true)
                    }}
                  >
                    <Pencil size={16} />
                    Edit Profile
                  </button>

                )}

            </div>

            {profileMessage && (

              <div className="profile-success">

                <CheckCircle2 size={18} />

                {profileMessage}

              </div>

            )}

            {loadingProfile ? (

              <div className="profile-loading">
                Loading profile...
              </div>

            ) : !profile ? (

              <div className="profile-empty">

                <UserRound size={45} />

                <h3>
                  Profile not found
                </h3>

                <p>
                  Your student profile could
                  not be loaded.
                </p>

              </div>

            ) : (

              <div className="profile-content">

                {/* ==================================================
                    BASIC INFORMATION
                    UID AND ROLE REMOVED
                ================================================== */}

                <div className="profile-section">

                  <div className="profile-section-heading">

                    <div>

                      <p className="dashboard-label">
                        BASIC INFORMATION
                      </p>

                      <h3>
                        Student details
                      </h3>

                    </div>

                  </div>

                  <div className="profile-grid">

                    {/* FULL NAME */}

                    <div className="profile-field">

                      <label>
                        Full Name
                      </label>

                      {editingProfile ? (

                        <input
                          type="text"
                          value={
                            profileForm.full_name
                          }
                          onChange={e =>
                            updateProfileField(
                              'full_name',
                              e.target.value
                            )
                          }
                          placeholder="Enter your full name"
                        />

                      ) : (

                        <div className="profile-value">
                          {profile.full_name ||
                            'Not provided'}
                        </div>

                      )}

                    </div>

                    {/* EMAIL */}

                    <div className="profile-field">

                      <label>
                        Email
                      </label>

                      <div className="profile-value profile-readonly">
                        {profile.email ||
                          'Not provided'}
                      </div>

                    </div>

                  </div>

                </div>

                {/* ==================================================
                    ACADEMIC INFORMATION
                ================================================== */}

                <div className="profile-section">

                  <div className="profile-section-heading">

                    <div>

                      <p className="dashboard-label">
                        ACADEMIC INFORMATION
                      </p>

                      <h3>
                        Course details
                      </h3>

                    </div>

                  </div>

                  <div className="profile-grid">

                    {/* COURSE */}

                    <div className="profile-field">

                      <label>
                        Course
                      </label>

                      {editingProfile ? (

                        <input
                          type="text"
                          value={
                            profileForm.course
                          }
                          onChange={e =>
                            updateProfileField(
                              'course',
                              e.target.value
                            )
                          }
                          placeholder="e.g. B.Tech Computer Science"
                        />

                      ) : (

                        <div className="profile-value">
                          {profile.course ||
                            'Not provided'}
                        </div>

                      )}

                    </div>

                    {/* YEAR */}

                    <div className="profile-field">

                      <label>
                        Year
                      </label>

                      {editingProfile ? (

                        <select
                          value={
                            profileForm.year
                          }
                          onChange={e =>
                            updateProfileField(
                              'year',
                              e.target.value
                            )
                          }
                        >

                          <option value="">
                            Select year
                          </option>

                          <option value="1">
                            1st Year
                          </option>

                          <option value="2">
                            2nd Year
                          </option>

                          <option value="3">
                            3rd Year
                          </option>

                          <option value="4">
                            4th Year
                          </option>

                          <option value="5">
                            5th Year
                          </option>

                        </select>

                      ) : (

                        <div className="profile-value">

                          {profile.year
                            ? `${profile.year}${
                                Number(
                                  profile.year
                                ) === 1
                                  ? 'st'
                                  : Number(
                                      profile.year
                                    ) === 2
                                  ? 'nd'
                                  : Number(
                                      profile.year
                                    ) === 3
                                  ? 'rd'
                                  : 'th'
                              } Year`
                            : 'Not provided'}

                        </div>

                      )}

                    </div>

                  </div>

                </div>

                {/* ==================================================
                    CONTACT INFORMATION
                ================================================== */}

                <div className="profile-section">

                  <div className="profile-section-heading">

                    <div>

                      <p className="dashboard-label">
                        CONTACT INFORMATION
                      </p>

                      <h3>
                        Contact details
                      </h3>

                    </div>

                  </div>

                  <div className="profile-grid">

                    {/* PHONE */}

                    <div className="profile-field">

                      <label>
                        Phone
                      </label>

                      {editingProfile ? (

                        <input
                          type="tel"
                          value={
                            profileForm.phone
                          }
                          onChange={e =>
                            updateProfileField(
                              'phone',
                              e.target.value
                            )
                          }
                          placeholder="Enter phone number"
                        />

                      ) : (

                        <div className="profile-value">
                          {profile.phone ||
                            'Not provided'}
                        </div>

                      )}

                    </div>

                    {/* GUARDIAN PHONE */}

                    <div className="profile-field">

                      <label>
                        Guardian Phone
                      </label>

                      {editingProfile ? (

                        <input
                          type="tel"
                          value={
                            profileForm.guardian_phone
                          }
                          onChange={e =>
                            updateProfileField(
                              'guardian_phone',
                              e.target.value
                            )
                          }
                          placeholder="Enter guardian phone"
                        />

                      ) : (

                        <div className="profile-value">
                          {profile.guardian_phone ||
                            'Not provided'}
                        </div>

                      )}

                    </div>

                  </div>

                </div>

                {/* ==================================================
                    GUARDIAN INFORMATION
                ================================================== */}

                <div className="profile-section">

                  <div className="profile-section-heading">

                    <div>

                      <p className="dashboard-label">
                        GUARDIAN INFORMATION
                      </p>

                      <h3>
                        Emergency contact
                      </h3>

                    </div>

                  </div>

                  <div className="profile-grid">

                    {/* GUARDIAN NAME */}

                    <div className="profile-field">

                      <label>
                        Guardian Name
                      </label>

                      {editingProfile ? (

                        <input
                          type="text"
                          value={
                            profileForm.guardian_name
                          }
                          onChange={e =>
                            updateProfileField(
                              'guardian_name',
                              e.target.value
                            )
                          }
                          placeholder="Enter guardian name"
                        />

                      ) : (

                        <div className="profile-value">
                          {profile.guardian_name ||
                            'Not provided'}
                        </div>

                      )}

                    </div>

                    {/* GUARDIAN PHONE */}

                    <div className="profile-field">

                      <label>
                        Guardian Phone
                      </label>

                      {editingProfile ? (

                        <input
                          type="tel"
                          value={
                            profileForm.guardian_phone
                          }
                          onChange={e =>
                            updateProfileField(
                              'guardian_phone',
                              e.target.value
                            )
                          }
                          placeholder="Enter guardian phone"
                        />

                      ) : (

                        <div className="profile-value">
                          {profile.guardian_phone ||
                            'Not provided'}
                        </div>

                      )}

                    </div>

                  </div>

                </div>

                {/* EDIT BUTTONS */}

                {editingProfile && (

                  <div className="profile-actions">

                    <button
                      className="profile-cancel"
                      onClick={() => {

                        if (profile) {

                          setProfileForm({
                            full_name:
                              profile.full_name ||
                              '',

                            phone:
                              profile.phone ||
                              '',

                            course:
                              profile.course ||
                              '',

                            year:
                              profile.year !==
                                null &&
                              profile.year !==
                                undefined
                                ? String(
                                    profile.year
                                  )
                                : '',

                            guardian_name:
                              profile.guardian_name ||
                              '',

                            guardian_phone:
                              profile.guardian_phone ||
                              '',
                          })

                        }

                        setEditingProfile(false)
                        setProfileMessage('')

                      }}
                      disabled={savingProfile}
                    >
                      Cancel
                    </button>

                    <button
                      className="profile-save"
                      onClick={saveProfile}
                      disabled={
                        savingProfile ||
                        !profileForm.full_name.trim()
                      }
                    >

                      <Save size={17} />

                      {savingProfile
                        ? 'Saving...'
                        : 'Save Changes'}

                    </button>

                  </div>

                )}

              </div>

            )}

          </div>

        )}

        {/* ==================================================
            OVERVIEW
        ================================================== */}

        {active === 'overview' && (

          <>

            <div className="dashboard-cards">

              {/* ROOM */}

              <article>

                <span>
                  <BedDouble size={19} />
                </span>

                <small>
                  ROOM
                </small>

                <strong>
                  {loadingRoom
                    ? 'Loading...'
                    : room
                      ? room.room_number
                      : 'Not allocated'}
                </strong>

                <p>
                  {room
                    ? `${getFloorText(
                        room.floor
                      )} Floor · ${
                        room.capacity
                      } Beds`
                    : 'No room assigned'}
                </p>

              </article>

              {/* COMPLAINTS */}

              <article>

                <span>
                  <ClipboardList size={19} />
                </span>

                <small>
                  COMPLAINTS
                </small>

                <strong>
                  {
                    complaints.filter(
                      c =>
                        c.status ===
                        'Open'
                    ).length
                  }{' '}
                  Open
                </strong>

                <p>
                  {complaints.length}{' '}
                  total requests
                </p>

              </article>

              {/* FEES */}

              <article>

                <span>
                  <CreditCard size={19} />
                </span>

                <small>
                  HOSTEL FEE
                </small>

                <strong>
                  {loadingFees
                    ? 'Loading...'
                    : latestFee
                      ? formatCurrency(
                          latestFee.amount
                        )
                      : 'No fee'}
                </strong>

                <p>
                  {latestFee
                    ? `Due: ${formatDate(
                        latestFee.due_date
                      )}`
                    : 'No fee assigned'}
                </p>

              </article>

            </div>

            {/* ACCOMMODATION */}

            <div className="dashboard-panel">

              <div className="panel-heading">

                <div>

                  <p className="dashboard-label">
                    ACCOMMODATION
                  </p>

                  <h2>
                    Your accommodation
                  </h2>

                </div>

                <button
                  className="panel-action"
                  onClick={refreshData}
                >
                  Refresh
                </button>

              </div>

              {loadingRoom ? (

                <p>
                  Loading room information...
                </p>

              ) : !room ? (

                <p>
                  No room has been allocated
                  to you yet.
                </p>

              ) : (

                <>

                  <div className="room-heading">

                    <strong>
                      Room {room.room_number}
                    </strong>

                    <p>
                      Floor {room.floor}
                      {' · '}
                      {room.occupied} /{' '}
                      {room.capacity} beds
                      occupied
                    </p>

                  </div>

                  <div>

                    <p className="dashboard-label">
                      ROOM MEMBERS
                    </p>

                    {roomMembers.length ===
                    0 ? (

                      <p>
                        No other students are
                        currently assigned to
                        this room.
                      </p>

                    ) : (

                      <div className="room-members">

                        {roomMembers.map(
                          member => (

                            <div
                              className="room-member"
                              key={member.id}
                            >

                              <div>

                                <strong>
                                  {
                                    member.full_name
                                  }
                                </strong>

                                <p>
                                  {member.email}
                                </p>

                              </div>

                              {member.id ===
                                profile?.id && (
                                <span>
                                  You
                                </span>
                              )}

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                </>

              )}

            </div>

            {/* QUICK ACTIONS */}

            <div className="dashboard-panel">

              <div className="panel-heading">

                <div>

                  <p className="dashboard-label">
                    QUICK ACTIONS
                  </p>

                  <h2>
                    What do you need?
                  </h2>

                </div>

              </div>

              <div className="quick-actions">

                <button
                  onClick={addComplaint}
                  disabled={addingComplaint}
                >

                  <MessageSquare size={20} />

                  <strong>
                    Raise Complaint
                  </strong>

                  <span>
                    Report a hostel issue
                  </span>

                </button>

                <button
                  onClick={() =>
                    setActive('fees')
                  }
                >

                  <CreditCard size={20} />

                  <strong>
                    View Fees
                  </strong>

                  <span>
                    Check payment status
                  </span>

                </button>

                <button
                  onClick={() =>
                    setActive('complaints')
                  }
                >

                  <ClipboardList size={20} />

                  <strong>
                    Track Requests
                  </strong>

                  <span>
                    See complaint updates
                  </span>

                </button>

              </div>

            </div>

          </>

        )}

        {/* ==================================================
            COMPLAINTS
        ================================================== */}

        {active === 'complaints' && (

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>

                <p className="dashboard-label">
                  REQUEST CENTER
                </p>

                <h2>
                  Your complaints
                </h2>

              </div>

              <button
                className="panel-action"
                onClick={addComplaint}
                disabled={addingComplaint}
              >
                + New Complaint
              </button>

            </div>

            {loadingComplaints ? (

              <p>
                Loading complaints...
              </p>

            ) : complaints.length === 0 ? (

              <p>
                You have not submitted any
                complaints yet.
              </p>

            ) : (

              <div className="complaint-list">

                {complaints.map(
                  complaint => (

                    <div
                      className="complaint-row"
                      key={complaint.id}
                    >

                      <div>

                        <strong>
                          {complaint.title}
                        </strong>

                        <span>
                          Request #
                          {complaint.id}
                          {' · '}
                          {new Date(
                            complaint.created_at
                          ).toLocaleDateString(
                            'en-IN'
                          )}
                        </span>

                      </div>

                      <div className="complaint-status">

                        <span
                          className={
                            complaint.status ===
                            'Open'
                              ? 'open'
                              : 'resolved'
                          }
                        >

                          {complaint.status ===
                          'Resolved' ? (

                            <>
                              <CheckCircle2
                                size={14}
                              />
                              Resolved
                            </>

                          ) : (

                            'Open'

                          )}

                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        )}

        {/* ==================================================
            FEES
        ================================================== */}

        {active === 'fees' && (

          <div
            className="dashboard-panel"
            style={{
              color: '#f8fafc',
            }}
          >

            <div className="panel-heading">

              <div>

                <p className="dashboard-label">
                  PAYMENT CENTER
                </p>

                <h2>
                  Hostel fees
                </h2>

              </div>

              <button
                className="panel-action"
                onClick={loadFees}
              >
                Refresh
              </button>

            </div>

            {loadingFees ? (

              <p>
                Loading fee information...
              </p>

            ) : fees.length === 0 ? (

              <div className="fee-empty">

                <CreditCard size={42} />

                <h3>
                  No fees assigned
                </h3>

                <p>
                  Your hostel fee information
                  will appear here when the
                  administration assigns a fee.
                </p>

              </div>

            ) : (

              <>

                <div
                  className="fee-summary"
                  style={{
                    marginBottom: '28px',
                  }}
                >

                  <div>

                    <small>
                      TOTAL FEES
                    </small>

                    <strong>
                      {formatCurrency(
                        totalFees
                      )}
                    </strong>

                  </div>

                  <div>

                    <small>
                      PAID
                    </small>

                    <strong>
                      {formatCurrency(
                        paidFees
                      )}
                    </strong>

                  </div>

                  <div>

                    <small>
                      PENDING
                    </small>

                    <strong>
                      {formatCurrency(
                        pendingFees
                      )}
                    </strong>

                  </div>

                </div>

                {latestFee && (

                  <div className="latest-fee">

                    <div className="latest-fee-top">

                      <div>

                        <p className="dashboard-label">
                          LATEST FEE
                        </p>

                        <h3>
                          {latestFee.description ||
                            'Hostel Fee'}
                        </h3>

                        <p>
                          Due date:{' '}
                          <strong>
                            {formatDate(
                              latestFee.due_date
                            )}
                          </strong>
                        </p>

                      </div>

                      <div className="latest-fee-amount">

                        <strong>
                          {formatCurrency(
                            latestFee.amount
                          )}
                        </strong>

                        <span
                          className={getFeeStatusClass(
                            latestFee.status
                          )}
                        >
                          {latestFee.status}
                        </span>

                      </div>

                    </div>

                    {latestFee.status ===
                      'Paid' &&
                      latestFee.payment_date && (

                        <p className="payment-date">

                          Payment received on{' '}

                          <strong>
                            {formatDate(
                              latestFee.payment_date
                            )}
                          </strong>

                        </p>

                      )}

                  </div>

                )}

                {fees.length > 1 && (

                  <div>

                    <p className="dashboard-label">
                      FEE HISTORY
                    </p>

                    <div className="fee-history">

                      {fees.map(
                        fee => (

                          <div
                            className="fee-history-row"
                            key={fee.id}
                          >

                            <div>

                              <strong>
                                {fee.description ||
                                  'Hostel Fee'}
                              </strong>

                              <p>
                                Due:{' '}
                                {formatDate(
                                  fee.due_date
                                )}
                              </p>

                            </div>

                            <div>

                              <strong>
                                {formatCurrency(
                                  fee.amount
                                )}
                              </strong>

                              <span
                                className={getFeeStatusClass(
                                  fee.status
                                )}
                              >
                                {fee.status}
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

                {latestFee &&
                  latestFee.status !== 'Paid' && (

                    <div className="payment-info">

                      <strong>
                        Payment information
                      </strong>

                      <p>
                        Your payment is currently
                        marked as{' '}
                        <strong>
                          {latestFee.status}
                        </strong>
                        . Please contact the
                        hostel administration if
                        you have questions about
                        your fee.
                      </p>

                    </div>

                  )}

              </>

            )}

          </div>

        )}

      </section>

    </main>
  )
}

export default Dashboard
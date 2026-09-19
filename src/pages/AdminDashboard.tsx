import { useEffect, useMemo, useState } from 'react'
import {
  BedDouble,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  UserRound,
  Users,
  UserPlus,
  Clock3,
  Trash2,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/AdminDashboard.css'

type Section =
  | 'overview'
  | 'students'
  | 'requests'
  | 'rooms'
  | 'complaints'
  | 'fees'

type Complaint = {
  id: number
  student: string
  room: string
  issue: string
  status: 'Open' | 'Resolved'
  created_at: string
}

type Student = {
  id: string
  full_name: string
  email: string
  phone: string | null
  course: string | null
  year: string | null
  guardian_name: string | null
  guardian_phone: string | null
}

type StudentRequest = {
  id: string
  auth_user_id: string
  full_name: string
  email: string
  phone: string | null
  course: string | null
  year: number | string | null
  guardian_name: string | null
  guardian_phone: string | null
  status: 'pending' | 'approved' | 'rejected'
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
  phone: string | null
  course: string | null
  year: string | null
}

type Fee = {
  id: number
  student_id: string
  amount: number
  paid_amount: number
  due_date: string
  status: string
  payment_date: string | null
  description: string | null
}

function AdminDashboard() {
  const navigate = useNavigate()

  const [active, setActive] =
    useState<Section>('overview')

  const [search, setSearch] =
    useState('')

  const [complaints, setComplaints] =
    useState<Complaint[]>([])

  const [students, setStudents] =
    useState<Student[]>([])

  // ==================================================
  // REGISTRATION REQUESTS
  // ==================================================

  const [requests, setRequests] =
    useState<StudentRequest[]>([])

  const [loadingRequests, setLoadingRequests] =
    useState(false)

  const [processingRequest, setProcessingRequest] =
    useState<string | null>(null)

  const [rooms, setRooms] =
    useState<Room[]>([])

  const [fees, setFees] =
    useState<Fee[]>([])

  const [loadingStudents, setLoadingStudents] =
    useState(false)

  const [loadingRooms, setLoadingRooms] =
    useState(false)

  const [loadingComplaints, setLoadingComplaints] =
    useState(false)

  const [loadingFees, setLoadingFees] =
    useState(false)

  const [addingFee, setAddingFee] =
    useState(false)

  const [error, setError] =
    useState('')

  // ==================================================
  // ROOM MEMBERS
  // ==================================================

  const [selectedRoom, setSelectedRoom] =
    useState<Room | null>(null)

  const [roomMembers, setRoomMembers] =
    useState<RoomMember[]>([])

  const [loadingMembers, setLoadingMembers] =
    useState(false)

  // ==================================================
  // ADMIN USER
  // ==================================================

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          'edustay_user'
        ) || '{}'
      )
    } catch {
      return {}
    }
  }, [])

  // ==================================================
  // ADMIN AUTH CHECK
  // ==================================================

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        navigate('/admin-login', {
          replace: true,
        })
        return
      }

      const {
        data: profile,
        error: profileError,
      } =
        await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', authUser.id)
          .single()

      if (
        profileError ||
        !profile ||
        profile.role !== 'admin'
      ) {
        await supabase.auth.signOut()

        localStorage.removeItem(
          'edustay_user'
        )

        navigate('/admin-login', {
          replace: true,
        })
      }
    }

    checkAdmin()
  }, [navigate])

  // ==================================================
  // LOAD STUDENTS
  // ==================================================

  const loadStudents = async () => {
    setLoadingStudents(true)
    setError('')

    const {
      data,
      error,
    } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        course,
        year,
        guardian_name,
        guardian_phone
      `)
      .eq('role', 'student')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Load students error:',
        error
      )

      setError(error.message)
      setStudents([])
    } else {
      setStudents(data || [])
    }

    setLoadingStudents(false)
  }

  // ==================================================
  // LOAD REGISTRATION REQUESTS
  // ==================================================

  const loadRequests = async () => {
    setLoadingRequests(true)
    setError('')

    try {
      const {
        data,
        error: requestError,
      } = await supabase
        .from('student_requests')
        .select(`
          id,
          auth_user_id,
          full_name,
          email,
          phone,
          course,
          year,
          guardian_name,
          guardian_phone,
          status,
          created_at
        `)
        .order('created_at', {
          ascending: false,
        })

      if (requestError) {
        console.error(
          'Load registration requests error:',
          requestError
        )

        setError(
          `Registration requests error: ${requestError.message}`
        )
        setRequests([])
        return
      }

      setRequests(
        (data || []) as StudentRequest[]
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load registration requests.'
      )

      setRequests([])
    } finally {
      setLoadingRequests(false)
    }
  }

  // ==================================================
  // LOAD ROOMS
  // ==================================================

  const loadRooms = async () => {
    setLoadingRooms(true)
    setError('')

    const {
      data,
      error,
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
      .order('room_number')

    if (error) {
      console.error(
        'Load rooms error:',
        error
      )

      setError(error.message)
      setRooms([])
    } else {
      setRooms(data || [])
    }

    setLoadingRooms(false)
  }

  // ==================================================
  // LOAD COMPLAINTS
  // ==================================================

  const loadComplaints = async () => {
    setLoadingComplaints(true)
    setError('')

    try {
      const {
        data: complaintData,
        error: complaintError,
      } = await supabase
        .from('complaints')
        .select(`
          id,
          student_id,
          title,
          status,
          created_at
        `)
        .order('created_at', {
          ascending: false,
        })

      if (complaintError) {
        setError(
          complaintError.message
        )
        setComplaints([])
        return
      }

      if (
        !complaintData ||
        complaintData.length === 0
      ) {
        setComplaints([])
        return
      }

      const studentIds =
        complaintData
          .map(
            complaint =>
              complaint.student_id
          )
          .filter(Boolean)

      if (studentIds.length === 0) {
        setComplaints(
          complaintData.map(
            complaint => ({
              id: complaint.id,
              student:
                'Unknown student',
              room:
                'Not allocated',
              issue:
                complaint.title,
              status:
                complaint.status ===
                'Resolved'
                  ? 'Resolved'
                  : 'Open',
              created_at:
                complaint.created_at,
            })
          )
        )

        return
      }

      const {
        data: profiles,
        error: profilesError,
      } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name
        `)
        .in(
          'id',
          studentIds
        )

      if (profilesError) {
        setError(
          profilesError.message
        )
        return
      }

      const {
        data: allocations,
        error: allocationsError,
      } = await supabase
        .from('room_allocations')
        .select(`
          student_id,
          room_id
        `)
        .in(
          'student_id',
          studentIds
        )

      if (allocationsError) {
        setError(
          allocationsError.message
        )
        return
      }

      const roomIds =
        (allocations || [])
          .map(
            allocation =>
              allocation.room_id
          )
          .filter(Boolean)

      let roomData: {
        id: number
        room_number: string
      }[] = []

      if (roomIds.length > 0) {
        const {
          data: roomsData,
          error: roomsError,
        } = await supabase
          .from('rooms')
          .select(`
            id,
            room_number
          `)
          .in(
            'id',
            roomIds
          )

        if (roomsError) {
          setError(
            roomsError.message
          )
          return
        }

        roomData =
          roomsData || []
      }

      const formattedComplaints =
        complaintData.map(
          complaint => {
            const profile =
              profiles?.find(
                profile =>
                  profile.id ===
                  complaint.student_id
              )

            const allocation =
              allocations?.find(
                allocation =>
                  allocation.student_id ===
                  complaint.student_id
              )

            const studentRoom =
              roomData.find(
                room =>
                  room.id ===
                  allocation?.room_id
              )

            return {
              id: complaint.id,
              student:
                profile?.full_name ||
                'Unknown student',
              room:
                studentRoom?.room_number ||
                'Not allocated',
              issue:
                complaint.title,
              status:
                complaint.status ===
                'Resolved'
                  ? 'Resolved'
                  : 'Open',
              created_at:
                complaint.created_at,
            }
          }
        )

      setComplaints(
        formattedComplaints
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load complaints.'
      )
    } finally {
      setLoadingComplaints(false)
    }
  }

  // ==================================================
  // LOAD FEES
  // ==================================================

  const loadFees = async () => {
    setLoadingFees(true)
    setError('')

    try {
      const {
        data,
        error,
      } = await supabase
        .from('fees')
        .select(`
          id,
          student_id,
          amount,
          paid_amount,
          due_date,
          status,
          payment_date,
          description
        `)
        .order('due_date', {
          ascending: false,
        })

      if (error) {
        console.error(
          'Load fees error:',
          error
        )

        setError(
          `Fees error: ${error.message}`
        )

        setFees([])
        return
      }

      setFees(
        (data || []).map(
          fee => ({
            ...fee,
            amount:
              Number(
                fee.amount || 0
              ),
            paid_amount:
              Number(
                fee.paid_amount || 0
              ),
          })
        ) as Fee[]
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load fees.'
      )

      setFees([])
    } finally {
      setLoadingFees(false)
    }
  }

  // ==================================================
  // INITIAL DATA LOAD
  // ==================================================

  useEffect(() => {
    loadStudents()
    loadRequests()
    loadRooms()
    loadComplaints()
    loadFees()
  }, [])

  // ==================================================
  // NAVIGATION
  // ==================================================

  const openSection = (
    section: Section
  ) => {
    setError('')
    setSearch('')
    setActive(section)

    if (section === 'students') {
      loadStudents()
    }

    if (section === 'requests') {
      loadRequests()
    }

    if (section === 'rooms') {
      loadRooms()
    }

    if (section === 'complaints') {
      loadComplaints()
    }

    if (section === 'fees') {
      loadFees()
    }
  }

  // ==================================================
  // LOGOUT
  // ==================================================

  const logout = async () => {
    await supabase.auth.signOut()

    localStorage.removeItem(
      'edustay_user'
    )

    navigate('/admin-login')
  }

  // ==================================================
  // APPROVE REGISTRATION REQUEST
  // ==================================================

  const approveRequest = async (
    request: StudentRequest
  ) => {
    const confirmed = window.confirm(
      `Approve registration for ${request.full_name}?`
    )

    if (!confirmed) return

    setError('')
    setProcessingRequest(request.id)

    try {
      const {
        data,
        error: approveError,
      } = await supabase.rpc(
        'approve_student_request',
        {
          p_request_id: request.id,
        }
      )

      if (approveError) {
        console.error(
          'Approve request error:',
          approveError
        )

        setError(
          approveError.message ||
            'Failed to approve registration request.'
        )
        return
      }

      if (
        data &&
        typeof data === 'object' &&
        'success' in data &&
        data.success === false
      ) {
        setError(
          'Failed to approve registration request.'
        )
        return
      }

      await loadRequests()
      await loadStudents()

      alert(
        `${request.full_name} has been approved successfully.`
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while approving the request.'
      )
    } finally {
      setProcessingRequest(null)
    }
  }

  // ==================================================
  // REJECT REGISTRATION REQUEST
  // ==================================================

  const rejectRequest = async (
    request: StudentRequest
  ) => {
    const confirmed = window.confirm(
      `Reject registration for ${request.full_name}?`
    )

    if (!confirmed) return

    setError('')
    setProcessingRequest(request.id)

    try {
      const {
        data,
        error: rejectError,
      } = await supabase.rpc(
        'reject_student_request',
        {
          p_request_id: request.id,
        }
      )

      if (rejectError) {
        console.error(
          'Reject request error:',
          rejectError
        )

        setError(
          rejectError.message ||
            'Failed to reject registration request.'
        )
        return
      }

      if (
        data &&
        typeof data === 'object' &&
        'success' in data &&
        data.success === false
      ) {
        setError(
          'Failed to reject registration request.'
        )
        return
      }

      await loadRequests()

      alert(
        `${request.full_name}'s registration request has been rejected.`
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while rejecting the request.'
      )
    } finally {
      setProcessingRequest(null)
    }
  }

  // ==================================================
  // RESOLVE COMPLAINT
  // ==================================================

  const resolveComplaint = async (
    id: number
  ) => {
    setError('')

    try {
      const {
        error: updateError,
      } = await supabase
        .from('complaints')
        .update({
          status: 'Resolved',
        })
        .eq('id', id)

      if (updateError) {
        setError(
          updateError.message
        )
        return
      }

      await loadComplaints()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to resolve complaint.'
      )
    }
  }

  // ==================================================
  // ADD STUDENT
  // ==================================================

  const addStudent = async () => {
    const full_name =
      window.prompt(
        'Student full name:'
      )

    if (!full_name?.trim()) return

    const email =
      window.prompt(
        'Student email:'
      )

    if (!email?.trim()) return

    const password =
      window.prompt(
        'Temporary password for the student:'
      )

    if (
      !password ||
      password.length < 6
    ) {
      setError(
        'Password must be at least 6 characters.'
      )
      return
    }

    const phone =
      window.prompt(
        'Phone number:'
      )

    const course =
      window.prompt('Course:')

    const yearText =
      window.prompt('Year:')

    const guardian_name =
      window.prompt(
        'Guardian name:'
      )

    const guardian_phone =
      window.prompt(
        'Guardian phone:'
      )

    const year =
      yearText?.trim() || null

    setError('')
    setLoadingStudents(true)

    try {
      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession()

      if (!session) {
        setError(
          'Your admin session has expired. Please log in again.'
        )

        navigate('/admin-login')
        return
      }

      const {
        data,
        error,
      } =
        await supabase.functions.invoke(
          'create-student',
          {
            body: {
              full_name:
                full_name.trim(),
              email:
                email.trim(),
              password,
              phone:
                phone?.trim() ||
                null,
              course:
                course?.trim() ||
                null,
              year,
              guardian_name:
                guardian_name?.trim() ||
                null,
              guardian_phone:
                guardian_phone?.trim() ||
                null,
            },
          }
        )

      if (error) {
        setError(
          error.message ||
            'Failed to create student.'
        )
        return
      }

      if (!data?.success) {
        setError(
          data?.error ||
            'Failed to create student.'
        )
        return
      }

      alert(
        `Student created successfully!\n\nEmail: ${email.trim()}\nTemporary password: ${password}`
      )

      await loadStudents()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setLoadingStudents(false)
    }
  }

  // ==================================================
  // DELETE STUDENT
  // ==================================================

  const deleteStudent = async (
    id: string
  ) => {
    const student =
      students.find(
        s => s.id === id
      )

    if (!student) {
      setError(
        'Student not found.'
      )
      return
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete ${student.full_name}?`
      )

    if (!confirmed) return

    setError('')
    setLoadingStudents(true)

    try {
      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession()

      if (!session) {
        setError(
          'Your admin session has expired. Please log in again.'
        )

        navigate('/admin-login')
        return
      }

      const {
        data,
        error,
      } =
        await supabase.functions.invoke(
          'delete-student',
          {
            body: {
              student_id: id,
            },
          }
        )

      if (error) {
        setError(
          error.message ||
            'Failed to delete student.'
        )
        return
      }

      if (!data?.success) {
        setError(
          data?.error ||
            'Failed to delete student.'
        )
        return
      }

      await loadStudents()
      await loadRooms()
      await loadComplaints()
      await loadFees()

      alert(
        'Student deleted successfully.'
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while deleting the student.'
      )
    } finally {
      setLoadingStudents(false)
    }
  }

  // ==================================================
  // ADD ROOM
  // ==================================================

  const addRoom = async () => {
    const room_number =
      window.prompt(
        'Room number (e.g. A-101):'
      )

    if (!room_number?.trim()) return

    const floorText =
      window.prompt('Floor:')

    const capacityText =
      window.prompt(
        'Capacity:',
        '2'
      )

    const floor =
      Number(floorText)

    const capacity =
      Number(capacityText)

    if (
      !Number.isInteger(floor) ||
      !Number.isInteger(
        capacity
      ) ||
      capacity < 1
    ) {
      setError(
        'Floor and capacity must be valid numbers.'
      )

      return
    }

    setError('')

    const { error } =
      await supabase
        .from('rooms')
        .insert({
          room_number:
            room_number.trim(),
          floor,
          capacity,
          occupied: 0,
          status: 'Available',
        })

    if (error) {
      setError(error.message)
    } else {
      await loadRooms()
    }
  }

  // ==================================================
  // REMOVE ROOM
  // ==================================================

  const removeRoom = async (room: Room) => {
    setError('')

    // Safety check: never remove a room that still has students.
    if (Number(room.occupied || 0) > 0) {
      setError(
        `Room ${room.room_number} cannot be removed because it still has ${room.occupied} occupied bed${room.occupied === 1 ? '' : 's'}. Reassign the students first.`
      )
      return
    }

    const { count, error: allocationError } =
      await supabase
        .from('room_allocations')
        .select('student_id', {
          count: 'exact',
          head: true,
        })
        .eq('room_id', room.id)

    if (allocationError) {
      console.error(
        'Check room allocations error:',
        allocationError
      )

      setError(
        allocationError.message
      )
      return
    }

    // Also protect against inconsistent occupied counts in the database.
    if ((count || 0) > 0) {
      setError(
        `Room ${room.room_number} still has student allocations. Reassign or remove those allocations before deleting the room.`
      )
      return
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to remove room ${room.room_number}? This action cannot be undone.`
      )

    if (!confirmed) {
      return
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError(
          'Your admin session has expired. Please log in again.'
        )

        navigate('/admin-login', {
          replace: true,
        })
        return
      }

      const { error: deleteError } =
        await supabase
          .from('rooms')
          .delete()
          .eq('id', room.id)

      if (deleteError) {
        console.error(
          'Remove room error:',
          deleteError
        )

        setError(
          deleteError.message ||
            `Failed to remove room ${room.room_number}.`
        )
        return
      }

      if (selectedRoom?.id === room.id) {
        closeRoomMembers()
      }

      await loadRooms()
      await loadComplaints()

      alert(
        `Room ${room.room_number} removed successfully.`
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : `Something went wrong while removing room ${room.room_number}.`
      )
    }
  }

  // ==================================================
  // ASSIGN STUDENT TO ROOM
  // ==================================================

  const assignStudentToRoom =
    async (
      roomId: number
    ) => {
      const room =
        rooms.find(
          r => r.id === roomId
        )

      if (!room) {
        setError(
          'Room not found.'
        )
        return
      }

      if (
        room.status ===
        'Maintenance'
      ) {
        setError(
          'This room is under maintenance.'
        )
        return
      }

      if (
        room.occupied >=
        room.capacity
      ) {
        setError(
          'This room is already full.'
        )
        return
      }

      if (
        students.length === 0
      ) {
        setError(
          'There are no students available to assign.'
        )
        return
      }

      const email =
        window.prompt(
          `Enter the student's email to assign to room ${room.room_number}:`
        )

      if (!email?.trim())
        return

      const student =
        students.find(
          s =>
            s.email
              .toLowerCase() ===
            email
              .trim()
              .toLowerCase()
        )

      if (!student) {
        setError(
          'No student found with that email.'
        )
        return
      }

      setError('')

      try {
        const {
          data,
          error,
        } =
          await supabase.rpc(
            'assign_student_to_room',
            {
              p_student_id:
                student.id,
              p_room_id:
                roomId,
            }
          )

        if (error) {
          setError(
            error.message ||
              'Failed to assign student.'
          )
          return
        }

        if (!data?.success) {
          setError(
            data?.error ||
              'Failed to assign student.'
          )
          return
        }

        await loadRooms()
        await loadComplaints()

        alert(
          `${student.full_name} has been assigned to room ${room.room_number}.`
        )
      } catch (err) {
        console.error(err)

        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong while assigning the room.'
        )
      }
    }

  // ==================================================
  // VIEW ROOM MEMBERS
  // ==================================================

  const viewRoomMembers =
    async (
      room: Room
    ) => {
      setError('')
      setSelectedRoom(room)
      setRoomMembers([])
      setLoadingMembers(true)

      try {
        const {
          data: allocations,
          error:
            allocationError,
        } =
          await supabase
            .from(
              'room_allocations'
            )
            .select(
              'student_id'
            )
            .eq(
              'room_id',
              room.id
            )

        if (allocationError) {
          setError(
            allocationError.message
          )
          return
        }

        if (
          !allocations ||
          allocations.length === 0
        ) {
          setRoomMembers([])
          return
        }

        const studentIds =
          allocations
            .map(
              allocation =>
                allocation.student_id
            )
            .filter(Boolean)

        if (
          studentIds.length === 0
        ) {
          setRoomMembers([])
          return
        }

        const {
          data: members,
          error:
            membersError,
        } =
          await supabase
            .from('profiles')
            .select(`
              id,
              full_name,
              email,
              phone,
              course,
              year
            `)
            .in(
              'id',
              studentIds
            )

        if (membersError) {
          setError(
            membersError.message
          )
          return
        }

        setRoomMembers(
          members || []
        )
      } catch (err) {
        console.error(err)

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load room members.'
        )
      } finally {
        setLoadingMembers(false)
      }
    }

  // ==================================================
  // CLOSE ROOM MEMBERS
  // ==================================================

  const closeRoomMembers = () => {
    setSelectedRoom(null)
    setRoomMembers([])
    setError('')
  }

  // ==================================================
  // ADD FEE
  // ==================================================

  const addFee = async () => {
    setError('')

    if (students.length === 0) {
      await loadStudents()
    }

    const studentEmail =
      window.prompt(
        'Enter the student email:'
      )

    if (!studentEmail?.trim())
      return

    const student =
      students.find(
        s =>
          s.email
            .toLowerCase() ===
          studentEmail
            .trim()
            .toLowerCase()
      )

    if (!student) {
      setError(
        'Student not found. Please use the exact student email.'
      )
      return
    }

    const amountText =
      window.prompt(
        'Enter total fee amount (₹):'
      )

    if (!amountText?.trim())
      return

    const amount =
      Number(
        amountText.replace(
          /,/g,
          ''
        )
      )

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError(
        'Fee amount must be a valid number greater than 0.'
      )
      return
    }

    const dueDate =
      window.prompt(
        'Enter due date (YYYY-MM-DD):',
        new Date()
          .toISOString()
          .split('T')[0]
      )

    if (!dueDate?.trim())
      return

    const description =
      window.prompt(
        'Fee description:',
        'Hostel Fee'
      )

    setAddingFee(true)

    try {
      const {
        error: insertError,
      } =
        await supabase
          .from('fees')
          .insert({
            student_id:
              student.id,
            amount,
            paid_amount: 0,
            due_date:
              dueDate.trim(),
            status:
              'Pending',
            payment_date:
              null,
            description:
              description?.trim() ||
              'Hostel Fee',
          })

      if (insertError) {
        console.error(
          'Add fee error:',
          insertError
        )

        setError(
          `Could not add fee: ${insertError.message}`
        )

        return
      }

      alert(
        `Fee of ${formatCurrency(amount)} assigned successfully to ${student.full_name}.`
      )

      await loadFees()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add fee.'
      )
    } finally {
      setAddingFee(false)
    }
  }

  // ==================================================
  // ADD PAYMENT
  // ==================================================

  const addPayment = async (
    fee: Fee
  ) => {
    setError('')

    const totalAmount =
      Number(fee.amount || 0)

    const currentPaid =
      Number(
        fee.paid_amount || 0
      )

    const remainingAmount =
      Math.max(
        totalAmount -
          currentPaid,
        0
      )

    if (
      remainingAmount <= 0
    ) {
      alert(
        'This fee is already fully paid.'
      )
      return
    }

    const paymentText =
      window.prompt(
        `Total fee: ${formatCurrency(totalAmount)}\nAlready paid: ${formatCurrency(currentPaid)}\nRemaining: ${formatCurrency(remainingAmount)}\n\nEnter payment amount (₹):`
      )

    if (
      !paymentText?.trim()
    ) {
      return
    }

    const paymentAmount =
      Number(
        paymentText.replace(
          /,/g,
          ''
        )
      )

    if (
      !Number.isFinite(
        paymentAmount
      ) ||
      paymentAmount <= 0
    ) {
      setError(
        'Payment amount must be a valid number greater than 0.'
      )
      return
    }

    if (
      paymentAmount >
      remainingAmount
    ) {
      setError(
        `Payment cannot be greater than the remaining amount of ${formatCurrency(remainingAmount)}.`
      )
      return
    }

    const newPaidAmount =
      currentPaid +
      paymentAmount

    const newRemainingAmount =
      Math.max(
        totalAmount -
          newPaidAmount,
        0
      )

    const newStatus =
      newRemainingAmount <= 0
        ? 'Paid'
        : 'Pending'

    try {
      const {
        error: updateError,
      } =
        await supabase
          .from('fees')
          .update({
            paid_amount:
              newPaidAmount,
            status:
              newStatus,
            payment_date:
              new Date().toISOString(),
          })
          .eq(
            'id',
            fee.id
          )

      if (updateError) {
        console.error(
          'Add payment error:',
          updateError
        )

        setError(
          `Could not add payment: ${updateError.message}`
        )

        return
      }

      alert(
        `Payment added successfully!\n\nPaid: ${formatCurrency(newPaidAmount)}\nRemaining: ${formatCurrency(newRemainingAmount)}`
      )

      await loadFees()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add payment.'
      )
    }
  }

  // ==================================================
  // FILTERS
  // ==================================================

  const filteredComplaints =
    complaints.filter(item =>
      `${item.student} ${item.room} ${item.issue}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    )

  const filteredStudents =
    students.filter(
      student =>
        `${student.full_name} ${student.email} ${
          student.course || ''
        } ${student.phone || ''}`
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    )

  const filteredRequests =
    requests.filter(request =>
      `${request.full_name} ${request.email} ${
        request.course || ''
      } ${request.phone || ''} ${
        request.status
      }`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    )

  // ==================================================
  // FEE HELPERS
  // ==================================================

  const getStudentName = (
    studentId: string
  ) => {
    const student =
      students.find(
        s => s.id === studentId
      )

    return (
      student?.full_name ||
      'Unknown student'
    )
  }

  const getStudentEmail = (
    studentId: string
  ) => {
    const student =
      students.find(
        s => s.id === studentId
      )

    return (
      student?.email ||
      ''
    )
  }

  const normalizeFeeStatus = (
    status: string
  ) => {
    return status
      .trim()
      .toLowerCase()
  }

  // ==================================================
  // FEE STATS
  // ==================================================

  const totalFees =
    fees.reduce(
      (sum, fee) =>
        sum +
        Number(
          fee.amount || 0
        ),
      0
    )

  const collectedFees =
    fees.reduce(
      (sum, fee) =>
        sum +
        Number(
          fee.paid_amount || 0
        ),
      0
    )

  const pendingFees =
    fees.reduce(
      (sum, fee) =>
        sum +
        Math.max(
          Number(
            fee.amount || 0
          ) -
            Number(
              fee.paid_amount ||
                0
            ),
          0
        ),
      0
    )

  // ==================================================
  // STATS
  // ==================================================

  const openComplaints =
    complaints.filter(
      c =>
        c.status === 'Open'
    ).length

  const occupiedBeds =
    rooms.reduce(
      (sum, room) =>
        sum +
        Number(
          room.occupied || 0
        ),
      0
    )

  const totalBeds =
    rooms.reduce(
      (sum, room) =>
        sum +
        Number(
          room.capacity || 0
        ),
      0
    )

  const availableBeds =
    Math.max(
      totalBeds -
        occupiedBeds,
      0
    )

  const maintenanceRooms =
    rooms.filter(
      room =>
        room.status ===
        'Maintenance'
    ).length

  const occupancyRate =
    totalBeds
      ? Math.round(
          (occupiedBeds /
            totalBeds) *
            100
        )
      : 0

  const formatCurrency = (
    amount: number
  ) =>
    new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }
    ).format(
      Number(amount || 0)
    )

  // ==================================================
  // UI
  // ==================================================

  return (
    <main className="admin-page">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <button
          className="admin-logo"
          onClick={() =>
            openSection(
              'overview'
            )
          }
        >
          EduStay<span>.</span>
          <small>ADMIN</small>
        </button>

        <nav className="admin-nav">

          <button
            type="button"
            className={
              active ===
              'overview'
                ? 'active'
                : ''
            }
            onClick={() =>
              openSection(
                'overview'
              )
            }
          >
            <LayoutDashboard
              size={17}
            />
            Overview
          </button>

          <button
            type="button"
            className={
              active ===
              'students'
                ? 'active'
                : ''
            }
            onClick={() =>
              openSection(
                'students'
              )
            }
          >
            <Users size={17} />
            Students
          </button>

          <button
            type="button"
            className={
              active ===
              'requests'
                ? 'active'
                : ''
            }
            onClick={() =>
              openSection(
                'requests'
              )
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <UserPlus size={17} />
            Registration Requests
            {requests.filter(
              request =>
                request.status === 'pending'
            ).length > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  minWidth: 21,
                  height: 21,
                  padding: '0 5px',
                  borderRadius: 999,
                  background: '#ef4444',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {requests.filter(
                  request =>
                    request.status === 'pending'
                ).length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={
              active ===
              'rooms'
                ? 'active'
                : ''
            }
            onClick={() =>
              openSection(
                'rooms'
              )
            }
          >
            <BedDouble size={17} />
            Rooms
          </button>

          <button
            type="button"
            className={
              active ===
              'complaints'
                ? 'active'
                : ''
            }
            onClick={() =>
              openSection(
                'complaints'
              )
            }
          >
            <MessageSquare
              size={17}
            />
            Complaints
          </button>

          <button
            type="button"
            className={
              active ===
              'fees'
                ? 'active'
                : ''
            }
            onClick={() =>
              openSection(
                'fees'
              )
            }
          >
            <CreditCard size={17} />
            Fees
          </button>

        </nav>

        <button
          type="button"
          className="admin-logout"
          onClick={logout}
        >
          <LogOut size={17} />
          Logout
        </button>

      </aside>

      {/* MAIN */}

      <section className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <p className="admin-label">
              ADMINISTRATION
            </p>

            <h1>
              {active ===
              'overview'
                ? 'Good afternoon, Admin.'
                : active === 'requests'
                ? 'Registration Requests'
                : active
                    .charAt(0)
                    .toUpperCase() +
                  active.slice(1)}
            </h1>

          </div>

          <div className="admin-header-right">

            <Bell size={18} />

            <span>
              <UserRound
                size={17}
              />

              {user.name ||
                user.full_name ||
                'Admin'}
            </span>

          </div>

        </header>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginBottom: 20,
              padding:
                '12px 16px',
              borderRadius: 10,
              background:
                '#fee2e2',
              color:
                '#991b1b',
            }}
          >
            {error}
          </div>
        )}

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {active ===
          'overview' && (
          <>

            <div className="admin-stat-grid">

              <article>
                <span>
                  <Users />
                </span>

                <small>
                  STUDENTS
                </small>

                <strong>
                  {
                    students.length
                  }
                </strong>

                <p>
                  Registered
                  students
                </p>
              </article>

              <article>
                <span>
                  <UserPlus />
                </span>

                <small>
                  PENDING REQUESTS
                </small>

                <strong>
                  {requests.filter(
                    request =>
                      request.status === 'pending'
                  ).length}
                </strong>

                <p>
                  Awaiting approval
                </p>
              </article>

              <article>
                <span>
                  <Building2 />
                </span>

                <small>
                  ROOMS
                </small>

                <strong>
                  {
                    occupancyRate
                  }%
                </strong>

                <p>
                  Occupancy rate
                </p>
              </article>

              <article>
                <span>
                  <MessageSquare />
                </span>

                <small>
                  COMPLAINTS
                </small>

                <strong>
                  {
                    openComplaints
                  }
                </strong>

                <p>
                  Need attention
                </p>
              </article>

              <article>
                <span>
                  <CreditCard />
                </span>

                <small>
                  FEES COLLECTED
                </small>

                <strong>
                  {formatCurrency(
                    collectedFees
                  )}
                </strong>

                <p>
                  Current records
                </p>
              </article>

            </div>

            <div className="admin-grid-two">

              <section className="admin-panel">

                <div className="admin-panel-title">

                  <div>

                    <p className="admin-label">
                      ATTENTION
                    </p>

                    <h2>
                      Open complaints
                    </h2>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openSection(
                        'complaints'
                      )
                    }
                  >
                    View all
                  </button>

                </div>

                <div className="admin-complaints">

                  {complaints
                    .filter(
                      c =>
                        c.status ===
                        'Open'
                    )
                    .slice(0, 5)
                    .map(
                      item => (
                        <div
                          className="admin-complaint"
                          key={
                            item.id
                          }
                        >

                          <div>

                            <strong>
                              {
                                item.issue
                              }
                            </strong>

                            <span>
                              {
                                item.student
                              }{' '}
                              · Room{' '}
                              {
                                item.room
                              }
                            </span>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              resolveComplaint(
                                item.id
                              )
                            }
                          >
                            Resolve
                          </button>

                        </div>
                      )
                    )}

                  {complaints.filter(
                    c =>
                      c.status ===
                      'Open'
                  ).length ===
                    0 && (
                    <p>
                      No open
                      complaints.
                    </p>
                  )}

                </div>

              </section>

              <section className="admin-panel">

                <div className="admin-panel-title">

                  <div>

                    <p className="admin-label">
                      HOSTEL
                    </p>

                    <h2>
                      Room occupancy
                    </h2>

                  </div>

                  <BedDouble
                    size={20}
                  />

                </div>

                <div className="occupancy">

                  <div>
                    <strong>
                      {
                        occupiedBeds
                      }
                    </strong>

                    <span>
                      Occupied beds
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        availableBeds
                      }
                    </strong>

                    <span>
                      Available beds
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        maintenanceRooms
                      }
                    </strong>

                    <span>
                      Maintenance
                    </span>
                  </div>

                </div>

                <button
                  type="button"
                  className="admin-wide-button"
                  onClick={() =>
                    openSection(
                      'rooms'
                    )
                  }
                >
                  Manage rooms
                </button>

              </section>

            </div>

            {requests.some(
              request =>
                request.status === 'pending'
            ) && (
              <section
                className="admin-panel"
                style={{
                  marginTop: 20,
                }}
              >
                <div className="admin-panel-title">
                  <div>
                    <p className="admin-label">
                      ACTION REQUIRED
                    </p>
                    <h2>
                      New registration requests
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openSection('requests')
                    }
                  >
                    Review requests
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {requests
                    .filter(
                      request =>
                        request.status === 'pending'
                    )
                    .slice(0, 5)
                    .map(request => (
                      <div
                        key={request.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 15,
                          padding: 14,
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.08)',
                          background: 'rgba(255,255,255,0.025)',
                        }}
                      >
                        <div>
                          <strong>
                            {request.full_name}
                          </strong>
                          <span
                            style={{
                              display: 'block',
                              marginTop: 4,
                              opacity: 0.6,
                              fontSize: 13,
                            }}
                          >
                            {request.email} · {request.course || 'Course not provided'}
                          </span>
                        </div>

                        <Clock3 size={18} />
                      </div>
                    ))}
                </div>
              </section>
            )}

          </>
        )}

        {/* =================================================
            STUDENTS
        ================================================= */}

        {active ===
          'students' && (
          <section className="admin-panel">

            <div className="admin-panel-title">

              <div>

                <p className="admin-label">
                  STUDENT MANAGEMENT
                </p>

                <h2>
                  All students
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  addStudent
                }
                disabled={
                  loadingStudents
                }
              >
                + Add Student
              </button>

            </div>

            <div className="admin-search">

              <Search size={17} />

              <input
                value={search}
                onChange={e =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search students..."
              />

            </div>

            <div className="admin-table">

              <div className="table-row table-head">

                <span>
                  Student
                </span>

                <span>
                  Email
                </span>

                <span>
                  Course
                </span>

                <span>
                  Status
                </span>

              </div>

              {loadingStudents ? (

                <div className="table-row">

                  <span>
                    Loading
                    students...
                  </span>

                </div>

              ) : filteredStudents.length ===
                0 ? (

                <div className="table-row">

                  <span>
                    No students
                    found.
                  </span>

                </div>

              ) : (

                filteredStudents.map(
                  student => (
                    <div
                      className="table-row"
                      key={
                        student.id
                      }
                    >

                      <span>
                        <strong>
                          {
                            student.full_name
                          }
                        </strong>
                      </span>

                      <span>
                        {
                          student.email
                        }
                      </span>

                      <span>
                        {
                          student.course ||
                          '—'
                        }
                      </span>

                      <span className="table-status">

                        <button
                          type="button"
                          onClick={() =>
                            deleteStudent(
                              student.id
                            )
                          }
                        >
                          Remove
                        </button>

                      </span>

                    </div>
                  )
                )

              )}

            </div>

          </section>
        )}

        {/* =================================================
            REGISTRATION REQUESTS
        ================================================= */}

        {active ===
          'requests' && (
          <section className="admin-panel">

            <div className="admin-panel-title">

              <div>
                <p className="admin-label">
                  STUDENT ONBOARDING
                </p>

                <h2>
                  Registration Requests
                </h2>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={loadRequests}
                  disabled={loadingRequests}
                >
                  {loadingRequests
                    ? 'Refreshing...'
                    : 'Refresh'}
                </button>

                <UserPlus size={20} />
              </div>
            </div>

            <div className="admin-search">
              <Search size={17} />

              <input
                value={search}
                onChange={e =>
                  setSearch(e.target.value)
                }
                placeholder="Search registration requests..."
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  padding: 15,
                  borderRadius: 12,
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.18)',
                }}
              >
                <small style={{ opacity: 0.6 }}>
                  PENDING
                </small>
                <strong
                  style={{
                    display: 'block',
                    marginTop: 5,
                    fontSize: 24,
                  }}
                >
                  {requests.filter(
                    request =>
                      request.status === 'pending'
                  ).length}
                </strong>
              </div>

              <div
                style={{
                  padding: 15,
                  borderRadius: 12,
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.18)',
                }}
              >
                <small style={{ opacity: 0.6 }}>
                  APPROVED
                </small>
                <strong
                  style={{
                    display: 'block',
                    marginTop: 5,
                    fontSize: 24,
                  }}
                >
                  {requests.filter(
                    request =>
                      request.status === 'approved'
                  ).length}
                </strong>
              </div>

              <div
                style={{
                  padding: 15,
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.18)',
                }}
              >
                <small style={{ opacity: 0.6 }}>
                  REJECTED
                </small>
                <strong
                  style={{
                    display: 'block',
                    marginTop: 5,
                    fontSize: 24,
                  }}
                >
                  {requests.filter(
                    request =>
                      request.status === 'rejected'
                  ).length}
                </strong>
              </div>
            </div>

            {loadingRequests ? (
              <div
                style={{
                  padding: 40,
                  textAlign: 'center',
                  opacity: 0.7,
                }}
              >
                Loading registration requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div
                style={{
                  padding: 50,
                  textAlign: 'center',
                  border: '1px dashed rgba(255,255,255,0.14)',
                  borderRadius: 14,
                }}
              >
                <UserPlus
                  size={42}
                  style={{
                    marginBottom: 10,
                    opacity: 0.5,
                  }}
                />

                <h3>
                  No registration requests
                </h3>

                <p
                  style={{
                    opacity: 0.6,
                    margin: '8px 0 0',
                  }}
                >
                  New Google student registrations will appear here.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {filteredRequests.map(request => (
                  <article
                    key={request.id}
                    style={{
                      padding: 18,
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.025)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 15,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <UserRound size={20} />
                          <strong
                            style={{
                              fontSize: 18,
                            }}
                          >
                            {request.full_name}
                          </strong>
                        </div>

                        <p
                          style={{
                            margin: '7px 0 0',
                            opacity: 0.65,
                          }}
                        >
                          {request.email}
                        </p>
                      </div>

                      <span
                        style={{
                          padding: '6px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background:
                            request.status === 'pending'
                              ? 'rgba(245,158,11,0.12)'
                              : request.status === 'approved'
                              ? 'rgba(34,197,94,0.12)'
                              : 'rgba(239,68,68,0.12)',
                          color:
                            request.status === 'pending'
                              ? '#fbbf24'
                              : request.status === 'approved'
                              ? '#4ade80'
                              : '#f87171',
                        }}
                      >
                        {request.status.toUpperCase()}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: 12,
                        marginTop: 18,
                        paddingTop: 15,
                        borderTop: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <div>
                        <small style={{ opacity: 0.45 }}>PHONE</small>
                        <strong
                          style={{
                            display: 'block',
                            marginTop: 4,
                          }}
                        >
                          {request.phone || '—'}
                        </strong>
                      </div>

                      <div>
                        <small style={{ opacity: 0.45 }}>COURSE</small>
                        <strong
                          style={{
                            display: 'block',
                            marginTop: 4,
                          }}
                        >
                          {request.course || '—'}
                        </strong>
                      </div>

                      <div>
                        <small style={{ opacity: 0.45 }}>YEAR</small>
                        <strong
                          style={{
                            display: 'block',
                            marginTop: 4,
                          }}
                        >
                          {request.year || '—'}
                        </strong>
                      </div>

                      <div>
                        <small style={{ opacity: 0.45 }}>GUARDIAN</small>
                        <strong
                          style={{
                            display: 'block',
                            marginTop: 4,
                          }}
                        >
                          {request.guardian_name || '—'}
                        </strong>
                      </div>

                      <div>
                        <small style={{ opacity: 0.45 }}>GUARDIAN PHONE</small>
                        <strong
                          style={{
                            display: 'block',
                            marginTop: 4,
                          }}
                        >
                          {request.guardian_phone || '—'}
                        </strong>
                      </div>

                      <div>
                        <small style={{ opacity: 0.45 }}>REQUESTED</small>
                        <strong
                          style={{
                            display: 'block',
                            marginTop: 4,
                          }}
                        >
                          {new Date(request.created_at).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </strong>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 10,
                          marginTop: 18,
                          paddingTop: 15,
                          borderTop: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <button
                          type="button"
                          disabled={
                            processingRequest === request.id
                          }
                          onClick={() =>
                            rejectRequest(request)
                          }
                          style={{
                            border: '1px solid rgba(239,68,68,0.3)',
                            background: 'rgba(239,68,68,0.08)',
                            color: '#f87171',
                          }}
                        >
                          {processingRequest === request.id
                            ? 'Processing...'
                            : 'Reject'}
                        </button>

                        <button
                          type="button"
                          disabled={
                            processingRequest === request.id
                          }
                          onClick={() =>
                            approveRequest(request)
                          }
                        >
                          {processingRequest === request.id
                            ? 'Processing...'
                            : 'Approve Student'}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

          </section>
        )}

        {/* =================================================
            ROOMS
        ================================================= */}

        {active ===
          'rooms' && (
          <section className="admin-panel">

            <div className="admin-panel-title">

              <div>

                <p className="admin-label">
                  HOSTEL MANAGEMENT
                </p>

                <h2>
                  Room allocation
                </h2>

              </div>

              <button
                type="button"
                onClick={addRoom}
                disabled={
                  loadingRooms
                }
              >
                + Add Room
              </button>

            </div>

            <div className="room-grid">

              {loadingRooms ? (

                <p>
                  Loading rooms...
                </p>

              ) : rooms.length ===
                0 ? (

                <p>
                  No rooms found.
                  Click "+ Add Room"
                  to create one.
                </p>

              ) : (

                rooms.map(
                  room => (

                    <div
                      className="room-card"
                      key={
                        room.id
                      }
                    >

                      <BedDouble
                        size={20}
                      />

                      <strong>
                        {
                          room.room_number
                        }
                      </strong>

                      <span>
                        {
                          room.occupied
                        }{' '}
                        /{' '}
                        {
                          room.capacity
                        }{' '}
                        Beds occupied
                      </span>

                      <small
                        className={
                          room.status ===
                          'Available'
                            ? 'available'
                            : ''
                        }
                      >
                        {
                          room.status.toUpperCase()
                        }
                      </small>

                      {room.status ===
                        'Available' && (
                        <button
                          type="button"
                          className="admin-wide-button"
                          onClick={() =>
                            assignStudentToRoom(
                              room.id
                            )
                          }
                        >
                          Assign Student
                        </button>
                      )}

                      {room.status ===
                        'Full' && (
                        <button
                          type="button"
                          className="admin-wide-button"
                          disabled
                        >
                          Room Full
                        </button>
                      )}

                      {room.status ===
                        'Maintenance' && (
                        <button
                          type="button"
                          className="admin-wide-button"
                          disabled
                        >
                          Maintenance
                        </button>
                      )}

                      <button
                        type="button"
                        className="admin-wide-button"
                        onClick={() =>
                          viewRoomMembers(
                            room
                          )
                        }
                        style={{
                          marginTop:
                            8,
                        }}
                      >
                        <Users
                          size={17}
                          style={{
                            marginRight:
                              6,
                            verticalAlign:
                              'middle',
                          }}
                        />
                        View Members
                      </button>

                      <button
                        type="button"
                        className="admin-wide-button"
                        onClick={() =>
                          removeRoom(
                            room
                          )
                        }
                        disabled={
                          room.occupied > 0
                        }
                        style={{
                          marginTop: 8,
                          border: '1px solid rgba(239,68,68,0.35)',
                          background: 'rgba(239,68,68,0.08)',
                          color: '#f87171',
                          opacity: room.occupied > 0 ? 0.5 : 1,
                          cursor: room.occupied > 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Trash2
                          size={17}
                          style={{
                            marginRight: 6,
                            verticalAlign: 'middle',
                          }}
                        />
                        Remove Room
                      </button>

                    </div>

                  )
                )

              )}

            </div>

          </section>
        )}

        {/* =================================================
            COMPLAINTS
        ================================================= */}

        {active ===
          'complaints' && (
          <section className="admin-panel">

            <div className="admin-panel-title">

              <div>

                <p className="admin-label">
                  SERVICE DESK
                </p>

                <h2>
                  Student complaints
                </h2>

              </div>

              <div
                style={{
                  display:
                    'flex',
                  gap: 10,
                  alignItems:
                    'center',
                }}
              >

                <button
                  type="button"
                  onClick={
                    loadComplaints
                  }
                  disabled={
                    loadingComplaints
                  }
                >
                  {loadingComplaints
                    ? 'Refreshing...'
                    : 'Refresh'}
                </button>

                <ClipboardList
                  size={20}
                />

              </div>

            </div>

            <div className="admin-search">

              <Search size={17} />

              <input
                value={search}
                onChange={e =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search complaints..."
              />

            </div>

            <div className="admin-complaints full">

              {loadingComplaints ? (

                <p>
                  Loading complaints...
                </p>

              ) : filteredComplaints.length ===
                0 ? (

                <p>
                  No complaints
                  found.
                </p>

              ) : (

                filteredComplaints.map(
                  item => (

                    <div
                      className="admin-complaint"
                      key={
                        item.id
                      }
                    >

                      <div>

                        <strong>
                          {
                            item.issue
                          }
                        </strong>

                        <span>
                          {
                            item.student
                          }{' '}
                          · Room{' '}
                          {
                            item.room
                          }
                        </span>

                        <span
                          style={{
                            display:
                              'block',
                            marginTop:
                              4,
                            opacity:
                              0.55,
                            fontSize:
                              12,
                          }}
                        >
                          Complaint #
                          {
                            item.id
                          }{' '}
                          ·{' '}
                          {new Date(
                            item.created_at
                          ).toLocaleDateString(
                            'en-IN'
                          )}
                        </span>

                      </div>

                      <div className="complaint-actions">

                        <span
                          className={
                            item.status ===
                            'Open'
                              ? 'open'
                              : 'resolved'
                          }
                        >

                          {item.status ===
                            'Resolved' && (
                            <CheckCircle2
                              size={14}
                            />
                          )}

                          {
                            item.status
                          }

                        </span>

                        {item.status ===
                          'Open' && (
                          <button
                            type="button"
                            onClick={() =>
                              resolveComplaint(
                                item.id
                              )
                            }
                          >
                            Mark resolved
                          </button>
                        )}

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </section>
        )}

        {/* =================================================
            FEES
        ================================================= */}

        {active ===
          'fees' && (
          <section className="admin-panel">

            <div className="admin-panel-title">

              <div>

                <p className="admin-label">
                  FINANCE
                </p>

                <h2>
                  Hostel fees
                </h2>

              </div>

              <div
                style={{
                  display:
                    'flex',
                  gap: 10,
                  alignItems:
                    'center',
                }}
              >

                <button
                  type="button"
                  onClick={addFee}
                  disabled={
                    addingFee ||
                    loadingFees
                  }
                >
                  {addingFee
                    ? 'Adding...'
                    : '+ Assign Fee'}
                </button>

                <button
                  type="button"
                  onClick={
                    loadFees
                  }
                  disabled={
                    loadingFees
                  }
                >
                  {loadingFees
                    ? 'Refreshing...'
                    : 'Refresh'}
                </button>

                <CreditCard
                  size={20}
                />

              </div>

            </div>

            {loadingFees ? (

              <div
                style={{
                  padding:
                    40,
                  textAlign:
                    'center',
                }}
              >
                Loading fees...
              </div>

            ) : (

              <>

                {/* FEE SUMMARY */}

                <div className="fee-admin-grid">

                  <div>

                    <small>
                      TOTAL FEES
                    </small>

                    <strong>
                      {
                        formatCurrency(
                          totalFees
                        )
                      }
                    </strong>

                    <span>
                      Total assigned
                    </span>

                  </div>

                  <div>

                    <small>
                      COLLECTED
                    </small>

                    <strong>
                      {
                        formatCurrency(
                          collectedFees
                        )
                      }
                    </strong>

                    <span>
                      Total paid
                    </span>

                  </div>

                  <div>

                    <small>
                      REMAINING
                    </small>

                    <strong>
                      {
                        formatCurrency(
                          pendingFees
                        )
                      }
                    </strong>

                    <span>
                      Total remaining
                    </span>

                  </div>

                </div>

                {/* NO FEES */}

                {fees.length ===
                0 ? (

                  <div
                    style={{
                      padding:
                        50,
                      textAlign:
                        'center',
                    }}
                  >

                    <CreditCard
                      size={40}
                    />

                    <h3>
                      No fees assigned
                    </h3>

                    <p>
                      No fee records
                      exist yet.
                    </p>

                    <button
                      type="button"
                      onClick={
                        addFee
                      }
                      disabled={
                        addingFee
                      }
                      style={{
                        marginTop:
                          15,
                      }}
                    >
                      + Assign First Fee
                    </button>

                  </div>

                ) : (

                  <div
                    style={{
                      marginTop:
                        25,
                    }}
                  >

                    <p className="admin-label">
                      FEE RECORDS
                    </p>

                    <div
                      style={{
                        display:
                          'grid',
                        gap: 12,
                      }}
                    >

                      {fees.map(
                        fee => {

                          const status =
                            normalizeFeeStatus(
                              fee.status
                            )

                          const total =
                            Number(
                              fee.amount ||
                                0
                            )

                          const paid =
                            Number(
                              fee.paid_amount ||
                                0
                            )

                          const remaining =
                            Math.max(
                              total -
                                paid,
                              0
                            )

                          const isFullyPaid =
                            remaining <=
                            0

                          return (
                            <div
                              key={
                                fee.id
                              }
                              style={{
                                padding:
                                  18,
                                border:
                                  '1px solid rgba(255,255,255,0.08)',
                                borderRadius:
                                  14,
                              }}
                            >

                              {/* STUDENT */}

                              <div
                                style={{
                                  display:
                                    'flex',
                                  justifyContent:
                                    'space-between',
                                  gap: 20,
                                  flexWrap:
                                    'wrap',
                                }}
                              >

                                <div
                                  style={{
                                    minWidth:
                                      220,
                                  }}
                                >

                                  <strong
                                    style={{
                                      display:
                                        'block',
                                      fontSize:
                                        17,
                                    }}
                                  >
                                    {
                                      getStudentName(
                                        fee.student_id
                                      )
                                    }
                                  </strong>

                                  <span
                                    style={{
                                      display:
                                        'block',
                                      marginTop:
                                        5,
                                      opacity:
                                        0.6,
                                      fontSize:
                                        13,
                                    }}
                                  >
                                    {
                                      getStudentEmail(
                                        fee.student_id
                                      )
                                    }
                                  </span>

                                  <span
                                    style={{
                                      display:
                                        'block',
                                      marginTop:
                                        8,
                                      opacity:
                                        0.6,
                                      fontSize:
                                        13,
                                    }}
                                  >
                                    {
                                      fee.description ||
                                      'Hostel Fee'
                                    }
                                  </span>

                                  <span
                                    style={{
                                      display:
                                        'block',
                                      marginTop:
                                        5,
                                      opacity:
                                        0.6,
                                      fontSize:
                                        13,
                                    }}
                                  >
                                    Due:{' '}
                                    {
                                      fee.due_date
                                    }
                                  </span>

                                </div>

                                {/* FEE DETAILS */}

                                <div
                                  style={{
                                    minWidth:
                                      190,
                                  }}
                                >

                                  <div
                                    style={{
                                      display:
                                        'grid',
                                      gap: 5,
                                    }}
                                  >

                                    <span
                                      style={{
                                        fontSize:
                                          14,
                                      }}
                                    >
                                      Total:{' '}
                                      <strong>
                                        {
                                          formatCurrency(
                                            total
                                          )
                                        }
                                      </strong>
                                    </span>

                                    <span
                                      style={{
                                        fontSize:
                                          14,
                                      }}
                                    >
                                      Paid:{' '}
                                      <strong>
                                        {
                                          formatCurrency(
                                            paid
                                          )
                                        }
                                      </strong>
                                    </span>

                                    <span
                                      style={{
                                        fontSize:
                                          14,
                                        fontWeight:
                                          700,
                                      }}
                                    >
                                      Remaining:{' '}
                                      <strong>
                                        {
                                          formatCurrency(
                                            remaining
                                          )
                                        }
                                      </strong>
                                    </span>

                                  </div>

                                  {/* STATUS */}

                                  <span
                                    style={{
                                      display:
                                        'inline-block',
                                      marginTop:
                                        8,
                                      padding:
                                        '5px 9px',
                                      borderRadius:
                                        999,
                                      fontSize:
                                        12,
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    {isFullyPaid
                                      ? 'Paid'
                                      : status ===
                                          'paid'
                                        ? 'Paid'
                                        : 'Pending'}
                                  </span>

                                  {/* ADD PAYMENT */}

                                  {!isFullyPaid && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        addPayment(
                                          fee
                                        )
                                      }
                                      style={{
                                        display:
                                          'flex',
                                        alignItems:
                                          'center',
                                        justifyContent:
                                          'center',
                                        gap: 8,
                                        marginTop:
                                          12,
                                        width:
                                          '100%',
                                        padding:
                                          '11px 16px',
                                        border:
                                          '1px solid rgba(249,115,22,0.5)',
                                        borderRadius:
                                          10,
                                        background:
                                          'rgba(249,115,22,0.12)',
                                        color:
                                          '#fb923c',
                                        fontSize:
                                          14,
                                        fontWeight:
                                          700,
                                        cursor:
                                          'pointer',
                                        transition:
                                          'all 0.2s ease',
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.background =
                                          'rgba(249,115,22,0.22)'

                                        e.currentTarget.style.borderColor =
                                          '#f97316'
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.background =
                                          'rgba(249,115,22,0.12)'

                                        e.currentTarget.style.borderColor =
                                          'rgba(249,115,22,0.5)'
                                      }}
                                    >
                                      + Add Payment
                                    </button>
                                  )}

                                </div>

                              </div>

                            </div>
                          )
                        }
                      )}

                    </div>

                  </div>

                )}

              </>

            )}

          </section>
        )}

      </section>

      {/* =================================================
          ROOM MEMBERS MODAL
      ================================================= */}

      {selectedRoom && (
        <div
          onClick={
            closeRoomMembers
          }
          style={{
            position:
              'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,0.65)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            zIndex: 9999,
            padding: 20,
          }}
        >

          <div
            onClick={e =>
              e.stopPropagation()
            }
            style={{
              width:
                'min(600px, 100%)',
              maxHeight:
                '80vh',
              overflowY:
                'auto',
              background:
                '#0b1020',
              border:
                '1px solid rgba(255,255,255,0.12)',
              borderRadius:
                18,
              padding: 24,
              boxShadow:
                '0 25px 80px rgba(0,0,0,0.5)',
            }}
          >

            <div
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                marginBottom:
                  24,
              }}
            >

              <div>

                <p className="admin-label">
                  ROOM MEMBERS
                </p>

                <h2
                  style={{
                    margin:
                      '4px 0',
                  }}
                >
                  Room{' '}
                  {
                    selectedRoom.room_number
                  }
                </h2>

                <span
                  style={{
                    opacity:
                      0.7,
                  }}
                >
                  {
                    selectedRoom.occupied
                  }{' '}
                  /{' '}
                  {
                    selectedRoom.capacity
                  }{' '}
                  beds occupied
                </span>

              </div>

              <button
                type="button"
                onClick={
                  closeRoomMembers
                }
                style={{
                  border:
                    'none',
                  background:
                    'transparent',
                  color:
                    'inherit',
                  cursor:
                    'pointer',
                  padding: 8,
                }}
              >
                <X
                  size={22}
                />
              </button>

            </div>

            {loadingMembers ? (

              <div
                style={{
                  padding:
                    '30px 10px',
                  textAlign:
                    'center',
                  opacity:
                    0.7,
                }}
              >
                Loading room
                members...
              </div>

            ) : roomMembers.length ===
              0 ? (

              <div
                style={{
                  padding:
                    '30px 10px',
                  textAlign:
                    'center',
                  opacity:
                    0.7,
                }}
              >

                <Users
                  size={38}
                />

                <p>
                  No students are
                  currently
                  allocated to this
                  room.
                </p>

              </div>

            ) : (

              <div
                style={{
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: 12,
                }}
              >

                {roomMembers.map(
                  member => (

                    <div
                      key={
                        member.id
                      }
                      style={{
                        padding:
                          16,
                        borderRadius:
                          12,
                        background:
                          'rgba(255,255,255,0.05)',
                        border:
                          '1px solid rgba(255,255,255,0.08)',
                      }}
                    >

                      <div
                        style={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap: 12,
                        }}
                      >

                        <div
                          style={{
                            width:
                              42,
                            height:
                              42,
                            borderRadius:
                              '50%',
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            background:
                              'rgba(59,130,246,0.15)',
                          }}
                        >
                          <UserRound
                            size={20}
                          />
                        </div>

                        <div>

                          <strong
                            style={{
                              display:
                                'block',
                              fontSize:
                                16,
                            }}
                          >
                            {
                              member.full_name
                            }
                          </strong>

                          <span
                            style={{
                              display:
                                'block',
                              marginTop:
                                3,
                              opacity:
                                0.65,
                              fontSize:
                                14,
                            }}
                          >
                            {
                              member.email
                            }
                          </span>

                        </div>

                      </div>

                      <div
                        style={{
                          display:
                            'grid',
                          gridTemplateColumns:
                            '1fr 1fr',
                          gap: 12,
                          marginTop:
                            14,
                          fontSize:
                            13,
                        }}
                      >

                        <div>
                          <span
                            style={{
                              opacity:
                                0.5,
                              display:
                                'block',
                            }}
                          >
                            PHONE
                          </span>

                          <strong>
                            {
                              member.phone ||
                              '—'
                            }
                          </strong>
                        </div>

                        <div>
                          <span
                            style={{
                              opacity:
                                0.5,
                              display:
                                'block',
                            }}
                          >
                            COURSE
                          </span>

                          <strong>
                            {
                              member.course ||
                              '—'
                            }
                          </strong>
                        </div>

                        <div>
                          <span
                            style={{
                              opacity:
                                0.5,
                              display:
                                'block',
                            }}
                          >
                            YEAR
                          </span>

                          <strong>
                            {
                              member.year ||
                              '—'
                            }
                          </strong>
                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

            <button
              type="button"
              className="admin-wide-button"
              onClick={
                closeRoomMembers
              }
              style={{
                marginTop: 20,
              }}
            >
              Close
            </button>

          </div>

        </div>
      )}

    </main>
  )
}

export default AdminDashboard
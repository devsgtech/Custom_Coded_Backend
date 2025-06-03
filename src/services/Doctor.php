<?php
include_once(__DIR__ ."/../autoload.php");

class Doctor {
    function getProfileData($inputdata)
    {
        global $con;
        $response = array(
            "status" => 0,
            "msg" => '',
            "errors" => array(),
            "data" => array()
        );
        $user_id = $doc_id = '';
        
        if(!empty($inputdata['user_id']) && !empty($inputdata['doc_id']))
        {
            $user_id = $inputdata['user_id'];
            $doc_id = $inputdata['doc_id'];
        }
        if($user_id == '' || $doc_id == '')
        {
            $response['errors'][] = 'User Id or Doctor Id cannot be empty';
        }
        if(empty($response['errors']))
        {
            $query = "Select * from doctor where doctor_id = '".safe_str($doc_id)."' and user_id = '".safe_str($user_id)."' and is_deleted = 0;";
            $result = $con->query($query);
            if($result->num_rows == 1)
            {
                $doc_details = $result->fetch_assoc();
                $response['status'] = 1;
                $response['msg'] = "Details fetched successfully";
                $response['data'] = $doc_details;
            }
            else{
                $response['errors'][]= "Doctor not found";
            }
        }
        return $response;
    }

    // function editDoctorProfile($params) {
    //     global $con; // Use global connection
    //     $response = array(
    //         "status" => 0,
    //         "msg"=> '',
    //         "errors" => array()
    //     );

    //     // Extract data from params
    //     $formData = $params['data'];
    //     $doc_id = $params['doc_id'];
    //     $user_id = $params['user_id'];

    //     // Check if user exists
    //     $user_id_escaped = mysqli_real_escape_string($con, $user_id);
    //     $user_query = "SELECT id FROM users WHERE id = '$user_id_escaped' and account_verified = 1";
    //     $user_result = mysqli_query($con, $user_query);
    //     if (mysqli_num_rows($user_result) == 0) {
    //         $response['errors'][] = "User does not exist.";
    //         return $response;
    //     }

    //     // Check if doctor exists
    //     $doc_id_escaped = mysqli_real_escape_string($con, $doc_id);
    //     $doctor_query = "SELECT doctor_id FROM doctor WHERE doctor_id = '$doc_id_escaped' AND user_id = '$user_id_escaped' and is_deleted = 0";
    //     $doctor_result = mysqli_query($con, $doctor_query);
    //     if (mysqli_num_rows($doctor_result) == 0) {
    //         $response['errors'][] = "Doctor does not exist.";
    //         return $response;
    //     }

    //     // Required fields
    //     $required_fields = [
    //         'name' => 'Name',
    //         'email' => 'Email',
    //         'mobile' => 'Mobile',
    //         'dob' => 'Date of Birth',
    //         'gender' => 'Gender',
    //         'education' => 'Education',
    //         'specialization' => 'Specialization',
    //         'address' => 'Address',
    //         'city' => 'City',
    //         'country' => 'Country',
    //         'state' => 'State/Province',
    //         'postal-code' => 'Postal Code',
    //         'biography' => 'Short Biography',
    //         'status' => 'Status'
    //     ];

    //     // Validate required fields
    //     foreach ($required_fields as $key => $label) {
    //         if (empty($formData[$key])) {
    //             $response['errors'][] = "$label is required.";
    //         }
    //     }

    //     // Additional validations
    //     if (!empty($formData['email']) && !filter_var($formData['email'], FILTER_VALIDATE_EMAIL)) {
    //         $response['errors'][] = "Invalid email format.";
    //     }

    //     if (!empty($formData['mobile']) && !preg_match('/^[0-9]{10}$/', $formData['mobile'])) {
    //         $response['errors'][] = "Mobile number must be 10 digits.";
    //     }

    //     if (!empty($formData['dob']) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $formData['dob'])) {
    //         $response['errors'][] = "Invalid date of birth format.";
    //     }

    //     if (!empty($formData['gender']) && !in_array($formData['gender'], ['male', 'female'])) {
    //         $response['errors'][] = "Gender must be 'male' or 'female'.";
    //     }

    //     if (!empty($formData['status']) && !in_array($formData['status'], ['active', 'inactive'])) {
    //         $response['errors'][] = "Status must be 'active' or 'inactive'.";
    //     }

    //     if (!empty($formData['specialization']) && !in_array($formData['specialization'], range(1, 14))) {
    //         $response['errors'][] = "Invalid specialization selected.";
    //     }

    //     // Validate password if provided
    //     if (!empty($formData['password'])) {
    //         if (strlen($formData['password']) < 8) {
    //             $response['errors'][] = "Password must be at least 8 characters long.";
    //         }
    //         if ($formData['password'] !== $formData['confirm-password']) {
    //             $response['errors'][] = "Passwords do not match.";
    //         }
    //     }

    //     // File upload validation
    //     $upload_dir = API_UPLOADS_URL . '/uploads/doctor/'; // Server-side path
    //     $db_prefix = '/doctor/'; // Database path prefix
    //     $allowed_image_types = ['image/jpeg', 'image/png'];
    //     $allowed_pdf_types = ['application/pdf'];
    //     $max_file_size = 5 * 1024 * 1024; // 5MB
    //     $files_to_process = ['avatar', 'certificate', 'agreement'];
    //     $file_paths = [];

    //     foreach ($files_to_process as $file_key) {
    //         if (!empty($formData['files'][$file_key]) && $formData['files'][$file_key]['error'] === UPLOAD_ERR_OK) {
    //             $file = $formData['files'][$file_key];
    //             $allowed_types = ($file_key === 'avatar') ? $allowed_image_types : $allowed_pdf_types;

    //             // Validate file type
    //             if (!in_array($file['type'], $allowed_types)) {
    //                 $response['errors'][] = ucfirst($file_key) . " must be a " . ($file_key === 'avatar' ? 'JPEG or PNG image' : 'PDF file') . ".";
    //                 continue;
    //             }

    //             // Validate file size
    //             if ($file['size'] > $max_file_size) {
    //                 $response['errors'][] = ucfirst($file_key) . " file size exceeds 5MB.";
    //                 continue;
    //             }

    //             $file_name = uniqid() . '_' . basename($file['name']);
    //             $file_path = $upload_dir . $file_name; // Server path: api-server/uploads/doctor/filename
    //             $db_file_path = $db_prefix . $file_name; // DB path: /doctor/filename
                
    //             if (!is_dir($upload_dir)) {
    //                 mkdir($upload_dir, 0755, true);
    //             }
    //             echo $file['tmp_name'];
    //             die;
    //             if (move_uploaded_file($file['tmp_name'], $file_path)) {
    //                 $file_paths[$file_key] = $db_file_path;
    //             } else {
    //                 $response['errors'][] = "Failed to upload " . ucfirst($file_key) . ".";
    //             }
    //         }
    //     }

    //     // If no errors, proceed with database updates
    //     if (empty($response['errors'])) {
    //         // Combine address fields into a single string
    //         $combined_address = implode(', ', [
    //             mysqli_real_escape_string($con, $formData['address']),
    //             mysqli_real_escape_string($con, $formData['city']),
    //             mysqli_real_escape_string($con, $formData['state']),
    //             mysqli_real_escape_string($con, $formData['country']),
    //             mysqli_real_escape_string($con, $formData['postal-code'])
    //         ]);

    //         // Escape all inputs
    //         $name = mysqli_real_escape_string($con, $formData['name']);
    //         $email = mysqli_real_escape_string($con, $formData['email']);
    //         $mobile = mysqli_real_escape_string($con, $formData['mobile']);
    //         $dob = mysqli_real_escape_string($con, $formData['dob']);
    //         $gender = mysqli_real_escape_string($con, strtoupper($formData['gender']));
    //         $education = mysqli_real_escape_string($con, $formData['education']);
    //         $biography = mysqli_real_escape_string($con, $formData['biography']);
    //         $is_deleted = ($formData['status'] === 'active') ? 0 : 1;
    //         $specialization = mysqli_real_escape_string($con, $formData['specialization']);

    //         // Build the UPDATE query for doctor table
    //         $sql = "UPDATE doctor SET 
    //                 name = '$name',
    //                 email = '$email',
    //                 mobile = '$mobile',
    //                 dob = '$dob',
    //                 gender = '$gender',
    //                 education = '$education',
    //                 bio = '$biography',
    //                 specialization = '$specialization',
    //                 address = '$combined_address'";

    //         // Add file fields if uploaded
    //         if (!empty($file_paths['avatar'])) {
    //             $avatar = mysqli_real_escape_string($con, $file_paths['avatar']);
    //             $sql .= ", profile_image = '$avatar'";
    //         }

    //         if (!empty($file_paths['certificate'])) {
    //             $certificate = mysqli_real_escape_string($con, $file_paths['certificate']);
    //             $sql .= ", certificate = '$certificate'";
    //         }

    //         if (!empty($file_paths['agreement'])) {
    //             $agreement = mysqli_real_escape_string($con, $file_paths['agreement']);
    //             $sql .= ", agreement_file = '$agreement'";
    //         }

    //         // Add password if provided
    //         if (!empty($formData['password'])) {
    //             $password = password_hash($formData['password'], PASSWORD_DEFAULT);
    //             $password = mysqli_real_escape_string($con, $password);
    //             $sql .= ", password = '$password'";
    //         }

    //         $sql .= " WHERE doctor_id = '$doc_id_escaped' AND user_id = '$user_id_escaped'";

    //         // Execute the doctor table update
    //         if (!mysqli_query($con, $sql)) {
    //             $response['errors'][] = "Failed to update doctor profile: " . mysqli_error($con);
    //             return $response;
    //         }

    //         // Update specialization in doctor_specialization_mapping
    //         $sql = "UPDATE doctor_specialization_mapping 
    //                 SET specialization_id = '$specialization' 
    //                 WHERE doctor_id = '$doc_id_escaped'";
            
    //         // Check if the record exists; if not, insert
    //         $check_mapping = "SELECT doctor_id FROM doctor_specialization_mapping WHERE doctor_id = '$doc_id_escaped'";
    //         $mapping_result = mysqli_query($con, $check_mapping);
            
    //         if (mysqli_num_rows($mapping_result) > 0) {
    //             // Update existing record
    //             if (!mysqli_query($con, $sql)) {
    //                 $response['errors'][] = "Failed to update specialization: " . mysqli_error($con);
    //                 return $response;
    //             }
    //         } else {
    //             // Insert new record
    //             $sql = "INSERT INTO doctor_specialization_mapping (doctor_id, specialization_id) 
    //                     VALUES ('$doc_id_escaped', '$specialization')";
    //             if (!mysqli_query($con, $sql)) {
    //                 $response['errors'][] = "Failed to insert specialization: " . mysqli_error($con);
    //                 return $response;
    //             }
    //         }

    //         $response['status'] = 1;
    //         $response['message'] = 'Profile updated successfully';
    //     }

    //     return $response;
    // }

    function getPatientlist($inputdata)
    {
        // print_r($inputdata);
        // die;
        global $con;
        $response = array(
            "status" => 0,
            "msg" => '',
            "errors" => array(),
            "data" => array(
                "patients" => array(),
                "total" => 0
            )
        );
        
        $user_id = $doc_id = '';
        $page = 1;
        $limit = 20;
        $search = '';

        // Validate and assign input data
        if (!empty($inputdata['user_id']) && !empty($inputdata['doc_id'])) {
            $user_id = $inputdata['user_id'];
            $doc_id = $inputdata['doc_id'];
        }
        if (isset($inputdata['page']) && is_numeric($inputdata['page']) && $inputdata['page'] > 0) {
            $page = (int)$inputdata['page'];
        }
        if (isset($inputdata['limit']) && is_numeric($inputdata['limit']) && $inputdata['limit'] > 0) {
            $limit = (int)$inputdata['limit'];
        }
        if (!empty($inputdata['search'])) {
            $search = $inputdata['search'];
        }

        // Validate required fields
        if ($user_id == '' || $doc_id == '') {
            $response['errors'][] = 'User ID or Doctor ID cannot be empty';
            return $response;
        }

        // Validate doctor existence
        $query = "SELECT * FROM doctor WHERE doctor_id = '" . safe_str($doc_id) . "' AND user_id = '" . safe_str($user_id) . "' AND is_deleted = 0";
        $result = $con->query($query);
        if ($result->num_rows != 1) {
            $response['errors'][] = 'Doctor not found';
            return $response;
        }

        // Fetch patients
        $offset = ($page - 1) * $limit;
        $searchTerm = '%' . safe_str($search) . '%';
        $whereClause = "WHERE is_deleted = 0";
        if ($search) {
            $whereClause .= " AND (name LIKE '" . $searchTerm . "' OR email LIKE '" . $searchTerm . "')";
        }

        // Query for patients
        $query = "SELECT name, mobile, email, gender, blood_group, allergies 
                FROM patient 
                $whereClause 
                ORDER BY name 
                LIMIT $limit OFFSET $offset";
        $result = $con->query($query);

        $patients = array();
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $patients[] = array(
                    'name' => $row['name'] ?? 'N/A',
                    'mobile' => $row['mobile'] ?? 'N/A',
                    'email' => $row['email'] ?? 'N/A',
                    'gender' => $row['gender'] ?? 'N/A',
                    'blood_group' => $row['blood_group'] ?? 'N/A',
                    'allergies' => $row['allergies'] ?? 'N/A'
                );
            }
        }

        // Get total count
        $totalQuery = "SELECT COUNT(*) as total 
                    FROM patient 
                    $whereClause";
        $totalResult = $con->query($totalQuery);
        $total = 0;
        if ($totalResult && $totalResult->num_rows > 0) {
            $totalRow = $totalResult->fetch_assoc();
            $total = (int)$totalRow['total'];
        }

        // Set response
        if (empty($response['errors'])) {
            $response['status'] = 1;
            $response['msg'] = 'Patients fetched successfully';
            $response['data']['patients'] = $patients;
            $response['data']['total'] = $total;
        } else {
            $response['msg'] = 'Error fetching patients';
        }

        return $response;
    }
}
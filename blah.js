app.post('/updateProfile', async (req, res) => {
    let oldUserId = req.session.userid;
    console.log('Old USERID:', oldUserId);
    let newUserId = req.body.userId;
    console.log('New USERID:', newUserId);
    // GET OLD NAME
    let oldName = req.session.name;
    console.log('Old Name:', oldName);
    //  GET OLD EMAIL
    let oldEmail = req.session.email;
    console.log('Old Email:', oldEmail);
  
    // GET NEW NAME FROM REQ BODY
    const newName = req.body.name;
    console.log('New Name:', newName);
  
    // GET NEW NAME FROM REQ BODY
    const newEmail = req.body.email;
    console.log('New email:', newEmail);
    //////////////////////////////////////////////////
    let oldPw = req.body.oldPassword;
    console.log('Old Password:', oldPw); // Log the old password
    //GET NEW PASSWORD
    let newPw = req.body.newPassword;
    console.log('NEW PW:', newPw); // Log the user object
  
    // Check if a new password is provided
    if (newPw) {
        let email = req.session.email;
        const user = await userCollection.findOne({ email: email });
  
        // If user exists and old password matches the stored password
        if (user && await bcrypt.compare(oldPw, user.password)) {
            console.log('User Password:', user.password); // Log the hashed password from the database
  
            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(newPw, saltRounds);
            console.log('Hashed New Password:', hashedNewPassword); // Log the hashed new password
  
  
            // Update the user's password in the database
            await userCollection.updateOne({ email: req.session.email }, { $set: { password: hashedNewPassword } });
        }
  
    }
    if (newName) {
        await userCollection.updateOne({ username: oldName }, { $set: { username: newName } });
        // Update the session with the new name
        req.session.name = newName;
    }
    if (newEmail) {
        await userCollection.updateOne({ email: oldEmail }, { $set: { email: newEmail } });
        // Update the session with the new email
        req.session.email = newEmail;
    }
  
    if (newUserId) {
        await userCollection.updateOne({ userid: oldUserId }, { $set: { userid: newUserId } });
        // Update the session with the new name
        req.session.userid = newUserId;
    }
  
    // Redirect back to the profile page after updating
    res.redirect('/profile');
  });


  const emailExists = (await userCollection.countDocuments({email: newEmail})) > 0 ? true : false;
  if (newEmail && !emailExists) {
    errorMessage = "Email already in use";
    
      await userCollection.updateOne({ email: oldEmail }, { $set: { email: newEmail } });
      // Update the session with the new email
      req.session.email = newEmail;
  }
  else {
    res.render("profile", {errorMessage: errorMessage});
    return;

  }

  //// let errorMessage = "";
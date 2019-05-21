<?php
if(is_array($_FILES)) {
if(is_uploaded_file($_FILES['userImage']['tmp_name'])) {
$sourcePath = $_FILES['userImage']['tmp_name'];
$targetPath = "images/".$_FILES['userImage']['name'];
if(move_uploaded_file($sourcePath,$targetPath)) {
?>
<img class="camera--output" src="<?php echo $targetPath; ?>"  />
<?php
}
}
}
?>

<?php
$host = '61.221.169.237';
$user = 'QCUL';
$pwd = 'stx308';
$port = '20';
// 進行ftp連線，根據port是否設定，傳遞的引數會不同
if(empty($port)){
$f_conn = ftp_connect($host);
}else{
$f_conn = ftp_connect($host, $port);
}
if(!$f_conn){
echo "connect fail\n";
exit(1);
}
echo "connect success\n";
// 進行ftp登入，使用給定的ftp登入使用者名稱和密碼進行login
$f_login = ftp_login($f_conn,$user,$pwd);
if(!$f_login){
echo "login fail\n";
exit(1);
}
echo "login success\n";
// 獲取當前所在的ftp目錄
$in_dir = ftp_pwd($f_conn);
if(!$in_dir){
echo "get dir info fail\n";
exit(1);
}
echo "$in_dir\n";
// 獲取當前所在ftp目錄下包含的目錄與檔案
$exist_dir = ftp_nlist($f_conn, ftp_pwd($f_conn));
print_r($exist_dir);
// 要求是按照日期在ftp目錄下建立資料夾作為檔案上傳存放目錄
echo date("Ymd")."\n";
$dir_name = date("Ymd");
// 檢查ftp目錄下是否已存在當前日期的資料夾，如不存在則進行建立
if(!in_array("$in_dir/$dir_name", $exist_dir)){
if(!ftp_mkdir($f_conn, $dir_name)){
echo "mkdir fail\n";
exit(1);
}else{
echo "mkdir $dir_name success\n";
}
}
// 切換目錄
if(!ftp_chdir($f_conn, $dir_name)){
echo "chdir fail\n";
exit(1);
}else{
echo "chdir $dir_name success\n";
}
// 進行檔案上傳
$result = ftp_put($f_conn, 'bbb.mp3', '/root/liang/ftp/bbb.mp3', FTP_BINARY);
if(!$result){
echo "upload file fail\n";
exit(1);
}else{
echo "upload file success\n";
exit(0);
}

?>
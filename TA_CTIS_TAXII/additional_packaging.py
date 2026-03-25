import logging
import subprocess
import pathlib
import shutil
import re
import os

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

UCC_APP_NAME = "TA_CTIS_TAXII"

def replace_mako_page_path(html_filepath):
    html_contents = open(html_filepath).read()
    replace_str = '/static/app/my-splunk-app/pages/'
    replace_with = f'/static/app/{UCC_APP_NAME}/pages/'
    if replace_str in html_contents:
        logger.info(f"Fixing mako page_path for {html_filepath}")
        edited = html_contents.replace(replace_str, replace_with)

        with open(html_filepath, "w") as f:
            f.write(edited)

def append_custom_conf_and_remove(custom_conf_filepath):
    assert custom_conf_filepath.name.endswith(".custom.conf")
    target_filename = re.sub(r'\.custom\.conf$', '.conf', custom_conf_filepath.name)
    target_filepath = custom_conf_filepath.parent / target_filename

    logger.info(f" >Appending {custom_conf_filepath} to {target_filepath}")
    with open(target_filepath, "a") as f:
        f.write(open(custom_conf_filepath).read())

    logger.info(f" >Removing {custom_conf_filepath}")
    os.remove(custom_conf_filepath)

def additional_packaging(ta_name=None):

    logger.info(f"Running Additional Packaging for {ta_name}")
    logger.info(f"path: {__file__}")

    this_script_directory = pathlib.Path(__file__).parent.absolute()
    project_root = this_script_directory.parent
    splunkui_dir = project_root / "splunkui"
    proc = subprocess.run(["yarn", "run", "build"], cwd=splunkui_dir)
    if proc.returncode != 0:
        raise RuntimeError(f"command failed with return code {proc.returncode}")

    shutil.copytree(splunkui_dir / "packages" / "my-splunk-app" / "stage" / "appserver", project_root / "output" / UCC_APP_NAME / "appserver", dirs_exist_ok=True)

    # For each html file in output/TA_CTIS_TAXII/appserver/templates replace `/static/app/my-splunk-app/pages/` with  `/static/app/TA_CTIS_TAXII/pages/`
    output_app_dir = project_root / "output" / UCC_APP_NAME
    templates_dir = output_app_dir / "appserver" / "templates"
    for filepath in templates_dir.rglob("*.html"):
        replace_mako_page_path(html_filepath=filepath)

    # Note: For XML view files, assume that we manually copy across each view to TA_CTIS_TAXII/package/default/data/ui/views

    default_dir = output_app_dir / "default"
    for filepath in default_dir.rglob("*.custom.conf"):
        logger.info(f"Custom .conf file: {filepath}")
        append_custom_conf_and_remove(custom_conf_filepath=filepath)

def cleanup_output_files(output_path: str, ta_name: str) -> None:
    """
    prepare a list for the files to be deleted after the source code has been copied to output directory
    :param output_path: The path provided in `--output` argument in ucc-gen command or the default output path.
    :param ta_name: The add-on name which is passed as a part of `--addon-name` argument during `ucc-gen init`
                    or present in app.manifest file of add-on.
    """
    logger.info(f"Cleaning up with {output_path} for {ta_name}")
